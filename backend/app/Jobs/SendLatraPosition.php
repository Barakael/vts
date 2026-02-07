<?php

namespace App\Jobs;

use App\Models\DevicePosition;
use App\Services\Latra\LatraClient;
use App\Services\Latra\LatraPayloadBuilder;
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

    /**
     * Create a new job instance.
     */
    public function __construct(private readonly int|string $devicePositionId)
    {
        $this->onQueue('default');
    }

    /**
     * Execute the job.
     */
    public function handle(LatraClient $client, LatraPayloadBuilder $builder): void
    {
        if (! config('latra.enabled')) {
            return;
        }

        $position = DevicePosition::query()->with('device')->find($this->devicePositionId);

        if ($position === null || $position->device === null) {
            Log::warning('LATRA job missing device position or device', [
                'device_position_id' => $this->devicePositionId,
            ]);
            return;
        }

        $payload = $builder->build($position->device, $position);
        $response = $client->sendPayload($payload);

        if (! $response->successful()) {
            $message = $response->message() ?? 'LATRA responded with failure.';
            Log::warning('LATRA integration failure', [
                'device_position_id' => $position->getKey(),
                'status_code' => $response->statusCode(),
                'status' => $response->status(),
                'message' => $message,
                'payload' => $payload,
            ]);

            throw new RuntimeException(sprintf('LATRA push failed: %s', $message));
        }

        Log::info('LATRA integration successful', [
            'device_position_id' => $position->getKey(),
            'vehicle_reg_no' => $position->device->reg_no,
            'status_code' => $response->statusCode(),
        ]);
    }

    public function failed(?Exception $exception): void
    {
        Log::error('LATRA job failed', [
            'device_position_id' => $this->devicePositionId,
            'exception' => $exception?->getMessage(),
        ]);
    }
}
