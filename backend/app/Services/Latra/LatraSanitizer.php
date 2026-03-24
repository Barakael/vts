<?php

namespace App\Services\Latra;

use App\Models\DevicePosition;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

/**
 * Transforms a raw DevicePosition into a single LATRA items-array entry,
 * applying the speed hard-cap and writing misbehavior events to the audit log.
 */
class LatraSanitizer
{
    public function __construct(private readonly LatraPayloadBuilder $builder) {}

    /**
     * Build a sanitized LATRA item array from a device position.
     * Misbehavior (tamper, hard-fault, overspeed) is recorded in the audit log.
     *
     * @return array<string, mixed>
     */
    public function sanitize(DevicePosition $position): array
    {
        $item = $this->builder->buildItem($position);

        $rawSpeed = (float) ($position->speed ?? 0);
        $cap      = (int)   config('latra.speed_cap', 90);
        $imei     = optional($position->device)->imei ?? $position->device_id;

        // ── Misbehavior audit ────────────────────────────────────────────────

        if ($rawSpeed > $cap) {
            Log::channel('latra_audit')->warning('OVERSPEED', [
                'event'     => 'OVERSPEED',
                'imei'      => $imei,
                'speed_kmh' => $rawSpeed,
                'cap_kmh'   => $cap,
                'recorded_at' => (string) $position->recorded_at,
                'position_id' => $position->getKey(),
            ]);
        }

        if ($item['activity_id'] === (int) config('latra.activity_id_tamper', 14)) {
            Log::channel('latra_audit')->warning('DEVICE_TAMPER', [
                'event'       => 'DEVICE_TAMPER',
                'imei'        => $imei,
                'activity_id' => $item['activity_id'],
                'recorded_at' => (string) $position->recorded_at,
                'position_id' => $position->getKey(),
            ]);
        }

        $hardFaultIoId = config('latra.hard_fault_io_id');
        if ($hardFaultIoId !== null) {
            $ioValues      = Arr::get($position->io ?? [], 'values', []);
            $hardFaultValue = $ioValues[$hardFaultIoId] ?? null;

            if ($hardFaultValue !== null && in_array((int) $hardFaultValue, config('latra.hard_fault_values', [1, 2]), true)) {
                Log::channel('latra_audit')->warning('HARD_FAULT', [
                    'event'            => 'HARD_FAULT',
                    'imei'             => $imei,
                    'hard_fault_value' => $hardFaultValue,
                    'io_id'            => $hardFaultIoId,
                    'recorded_at'      => (string) $position->recorded_at,
                    'position_id'      => $position->getKey(),
                ]);
            }
        }

        // ── Speed hard-cap ───────────────────────────────────────────────────
        $item['horizontal_speed'] = (float) min($rawSpeed, $cap);

        return $item;
    }
}
