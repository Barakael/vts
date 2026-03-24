<?php

namespace App\Jobs;

use App\Models\DevicePosition;
use App\Services\Latra\LatraBuffer;
use App\Services\Latra\LatraClient;
use App\Services\Latra\LatraInterpolator;
use App\Services\Latra\LatraPayloadBuilder;
use App\Services\Latra\LatraSanitizer;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class SendLatraPosition implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(private readonly int|string $devicePositionId)
    {
        $this->onQueue('default');
    }

    public function handle(
        LatraClient       $client,
        LatraPayloadBuilder $builder,
        LatraSanitizer    $sanitizer,
        LatraInterpolator $interpolator,
        LatraBuffer       $buffer,
    ): void {
        if (! config('latra.enabled')) {
            return;
        }

        $position = DevicePosition::query()->with('device')->find($this->devicePositionId);

        if ($position === null || $position->device === null) {
            Log::warning('LATRA job: missing device position or device', [
                'device_position_id' => $this->devicePositionId,
            ]);
            return;
        }

        $device = $position->device;

        // ── Gap-filling ──────────────────────────────────────────────────────
        // Find the most recent position for this device that was recorded
        // strictly *before* the current one, so we can detect time gaps.
        $prev = DevicePosition::query()
            ->where('device_id', $device->id)
            ->where('recorded_at', '<', $position->recorded_at)
            ->orderByDesc('recorded_at')
            ->first();

        if ($prev !== null) {
            $ghosts = $interpolator->interpolate($prev, $position);
            foreach ($ghosts as $ghost) {
                $buffer->push($device->id, $ghost, isGhost: true);
            }
        }

        // ── Sanitize & buffer the real point ────────────────────────────────
        $item = $sanitizer->sanitize($position);
        $buffer->push($device->id, $item);

        // ── Flush on the nearest multiple of 3 ──────────────────────────────
        $batch = $buffer->extractBatch($device->id);

        if ($batch->isEmpty()) {
            return;
        }

        $items   = $batch->map(fn ($row) => $row->payload_item)->values()->all();
        $payload = $builder->buildFromItems($device, $items);
        $response = $client->sendPayload($payload);

        if (! $response->successful()) {
            $message = $response->message() ?? 'LATRA responded with failure.';
            Log::warning('LATRA integration failure', [
                'device_position_id' => $position->getKey(),
                'items_count'        => count($items),
                'status_code'        => $response->statusCode(),
                'status'             => $response->status(),
                'message'            => $message,
            ]);

            throw new RuntimeException(sprintf('LATRA push failed: %s', $message));
        }

        Log::info('LATRA integration successful', [
            'device_position_id' => $position->getKey(),
            'vehicle_reg_no'     => $device->reg_no,
            'items_count'        => count($items),
            'status_code'        => $response->statusCode(),
        ]);
    }

    public function failed(?Exception $exception): void
    {
        Log::error('LATRA job failed', [
            'device_position_id' => $this->devicePositionId,
            'exception'          => $exception?->getMessage(),
        ]);
    }
}
