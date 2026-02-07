<?php

namespace App\Services\Latra;

use App\Models\Device;
use App\Models\DevicePosition;
use Illuminate\Support\Arr;
use RuntimeException;

class LatraPayloadBuilder
{
    public function build(Device $device, DevicePosition $position): array
    {
        $registration = trim((string) $device->reg_no);
        if ($registration === '') {
            throw new RuntimeException('LATRA payload requires a vehicle registration number.');
        }

        $recordedAt = $position->recorded_at;
        if ($recordedAt === null) {
            throw new RuntimeException('Device position timestamp is missing.');
        }

        $items = [[
            'latitude' => (float) $position->latitude,
            'longitude' => (float) $position->longitude,
            'time' => (int) $recordedAt->getTimestampMs(),
            'horizontal_speed' => (float) ($position->speed ?? 0),
            'bearing' => (int) ($position->angle ?? 0),
            'altitude' => (int) ($position->altitude ?? 0),
            'satellite_count' => (int) ($position->satellites ?? 0),
            'hdop' => $this->ioMetric($position, 'hdop'),
            'rssi' => $this->ioMetric($position, 'rssi'),
            'mcc' => $this->ioMetric($position, 'mcc'),
            'lac' => $this->ioMetric($position, 'lac'),
            'cell_id' => $this->ioMetric($position, 'cell_id'),
            'mgs_id' => $this->messageId($position),
            'activity_id' => $this->activityId($position),
        ]];

        return [
            'vehicle_reg_no' => $registration,
            'type' => 'poi',
            'imei' => $device->imei,
            'items' => $items,
        ];
    }

    private function activityId(DevicePosition $position): int
    {
        $map = config('latra.activity_map', []);
        $eventId = (int) ($position->event_id ?? 0);

        if (array_key_exists($eventId, $map)) {
            return (int) $map[$eventId];
        }

        if (array_key_exists('default', $map)) {
            return (int) $map['default'];
        }

        return 1;
    }

    private function messageId(DevicePosition $position): int
    {
        $primary = $position->getKey();
        if ($primary !== null) {
            return (int) $primary;
        }

        $recordedAt = $position->recorded_at;
        if ($recordedAt !== null) {
            return (int) $recordedAt->getTimestampMs();
        }

        return (int) floor(microtime(true) * 1000);
    }

    private function ioMetric(DevicePosition $position, string $key): mixed
    {
        $ioId = config("latra.io_keys.$key");
        if ($ioId === null) {
            return null;
        }

        $values = Arr::get($position->io ?? [], 'values', []);
        if (! is_array($values)) {
            return null;
        }

        $value = $values[$ioId] ?? null;
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return $value + 0;
        }

        return $value;
    }
}
