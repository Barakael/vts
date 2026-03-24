<?php

namespace Tests\Unit;

use App\Models\Device;
use App\Models\DevicePosition;
use App\Services\Latra\LatraPayloadBuilder;
use App\Services\Latra\LatraSanitizer;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class LatraSanitizerTest extends TestCase
{
    private DevicePosition $position;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'latra.speed_cap'          => 90,
            'latra.activity_id_tamper' => 14,
            'latra.hard_fault_io_id'   => 11,
            'latra.hard_fault_values'  => [1, 2],
            'latra.activity_map'       => ['default' => 1, 14 => 14],
            'latra.io_keys'            => [
                'hdop' => null, 'rssi' => null,
                'mcc'  => null, 'lac'  => null, 'cell_id' => null,
            ],
        ]);

        $device = new Device(['reg_no' => 'T999', 'imei' => '111111111111111']);

        $this->position = new DevicePosition();
        $this->position->forceFill([
            'id'          => 1,
            'device_id'   => 7,
            'latitude'    => -6.8,
            'longitude'   => 39.2,
            'speed'       => 60,
            'angle'       => 90,
            'altitude'    => 100,
            'satellites'  => 8,
            'event_id'    => 0,
            'recorded_at' => CarbonImmutable::now(),
            'io'          => ['values' => []],
        ]);
        $this->position->setRelation('device', $device);
    }

    // ── Speed cap ────────────────────────────────────────────────────────────

    public function test_speed_within_cap_passes_through(): void
    {
        $this->position->forceFill(['speed' => 60]);

        $item = $this->sanitizer()->sanitize($this->position);

        $this->assertSame(60.0, $item['horizontal_speed']);
    }

    public function test_speed_exceeding_cap_is_clamped_to_90(): void
    {
        $this->position->forceFill(['speed' => 120]);

        $item = $this->sanitizer()->sanitize($this->position);

        $this->assertSame(90.0, $item['horizontal_speed']);
    }

    public function test_speed_exactly_at_cap_is_not_clamped(): void
    {
        $this->position->forceFill(['speed' => 90]);

        $item = $this->sanitizer()->sanitize($this->position);

        $this->assertSame(90.0, $item['horizontal_speed']);
    }

    // ── Misbehavior logging ───────────────────────────────────────────────────

    public function test_overspeed_is_logged_to_audit_channel(): void
    {
        Log::shouldReceive('channel')
            ->with('latra_audit')
            ->once()
            ->andReturnSelf();
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn (string $msg) => $msg === 'OVERSPEED');

        $this->position->forceFill(['speed' => 150]);
        $this->sanitizer()->sanitize($this->position);
    }

    public function test_normal_speed_does_not_log_overspeed(): void
    {
        Log::shouldReceive('channel')->never();

        $this->position->forceFill(['speed' => 50, 'event_id' => 0]);
        $this->sanitizer()->sanitize($this->position);
    }

    public function test_tamper_activity_id_is_logged(): void
    {
        Log::shouldReceive('channel')
            ->with('latra_audit')
            ->once()
            ->andReturnSelf();
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn (string $msg) => $msg === 'DEVICE_TAMPER');

        // event_id 14 maps to activity_id 14 via the activity_map
        $this->position->forceFill(['event_id' => 14, 'speed' => 50]);
        $this->sanitizer()->sanitize($this->position);
    }

    public function test_hard_fault_value_1_is_logged(): void
    {
        Log::shouldReceive('channel')
            ->with('latra_audit')
            ->once()
            ->andReturnSelf();
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn (string $msg) => $msg === 'HARD_FAULT');

        $this->position->forceFill([
            'speed'    => 30,
            'event_id' => 0,
            'io'       => ['values' => [11 => 1]],
        ]);
        $this->sanitizer()->sanitize($this->position);
    }

    public function test_hard_fault_value_2_is_logged(): void
    {
        Log::shouldReceive('channel')
            ->with('latra_audit')
            ->once()
            ->andReturnSelf();
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn (string $msg) => $msg === 'HARD_FAULT');

        $this->position->forceFill([
            'speed'    => 30,
            'event_id' => 0,
            'io'       => ['values' => [11 => 2]],
        ]);
        $this->sanitizer()->sanitize($this->position);
    }

    public function test_non_fault_io_value_is_not_logged(): void
    {
        Log::shouldReceive('channel')->never();

        $this->position->forceFill([
            'speed'    => 30,
            'event_id' => 0,
            'io'       => ['values' => [11 => 0]],
        ]);
        $this->sanitizer()->sanitize($this->position);
    }

    public function test_returns_correct_item_structure(): void
    {
        $item = $this->sanitizer()->sanitize($this->position);

        $this->assertArrayHasKey('latitude', $item);
        $this->assertArrayHasKey('longitude', $item);
        $this->assertArrayHasKey('time', $item);
        $this->assertArrayHasKey('horizontal_speed', $item);
        $this->assertArrayHasKey('bearing', $item);
        $this->assertArrayHasKey('altitude', $item);
        $this->assertArrayHasKey('satellite_count', $item);
        $this->assertArrayHasKey('mgs_id', $item);
        $this->assertArrayHasKey('activity_id', $item);
    }

    // ──────────────────────────────────────────────────────────────────────────

    private function sanitizer(): LatraSanitizer
    {
        return new LatraSanitizer(new LatraPayloadBuilder());
    }
}
