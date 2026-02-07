<?php

namespace Tests\Unit;

use App\Models\Device;
use App\Models\DevicePosition;
use App\Services\Latra\LatraPayloadBuilder;
use Carbon\CarbonImmutable;
use RuntimeException;
use Tests\TestCase;

class LatraPayloadBuilderTest extends TestCase
{
    public function test_it_builds_payload_from_device_and_position(): void
    {
        config([
            'latra.io_keys' => [
                'hdop' => 66,
                'rssi' => 199,
                'mcc' => 200,
                'lac' => 201,
                'cell_id' => 202,
            ],
            'latra.activity_map' => [
                'default' => 1,
                55 => 8,
            ],
        ]);

        $device = new Device([
            'reg_no' => 'T123ABC',
            'imei' => '123456789012345',
        ]);

        $recordedAt = CarbonImmutable::create(2026, 2, 7, 13, 0, 0, 'UTC');

        $position = new DevicePosition();
        $position->forceFill([
            'id' => 42,
            'latitude' => -6.8,
            'longitude' => 39.2,
            'speed' => 65,
            'angle' => 120,
            'altitude' => 560,
            'satellites' => 10,
            'event_id' => 55,
            'recorded_at' => $recordedAt,
            'io' => [
                'values' => [
                    66 => 0.8,
                    199 => -70,
                    200 => 640,
                    201 => 12804,
                    202 => 445566,
                ],
            ],
        ]);

        $builder = new LatraPayloadBuilder();
        $payload = $builder->build($device, $position);

        $this->assertSame('T123ABC', $payload['vehicle_reg_no']);
        $this->assertSame('poi', $payload['type']);
        $this->assertSame('123456789012345', $payload['imei']);

        $this->assertCount(1, $payload['items']);
        $item = $payload['items'][0];

        $this->assertSame(-6.8, $item['latitude']);
        $this->assertSame(39.2, $item['longitude']);
        $this->assertSame($recordedAt->getTimestampMs(), $item['time']);
        $this->assertSame(65.0, $item['horizontal_speed']);
        $this->assertSame(120, $item['bearing']);
        $this->assertSame(560, $item['altitude']);
        $this->assertSame(10, $item['satellite_count']);
        $this->assertSame(0.8, $item['hdop']);
        $this->assertSame(-70, $item['rssi']);
        $this->assertSame(640, $item['mcc']);
        $this->assertSame(12804, $item['lac']);
        $this->assertSame(445566, $item['cell_id']);
        $this->assertSame(42, $item['mgs_id']);
        $this->assertSame(8, $item['activity_id']);
    }

    public function test_it_requires_registration_number(): void
    {
        $this->expectException(RuntimeException::class);

        $device = new Device([
            'reg_no' => null,
            'imei' => '123456789012345',
        ]);

        $position = new DevicePosition([
            'recorded_at' => CarbonImmutable::now(),
        ]);

        $builder = new LatraPayloadBuilder();
        $builder->build($device, $position);
    }
}
