<?php

namespace Tests\Feature;

use App\Jobs\SendLatraPosition;
use App\Models\Device;
use App\Models\DevicePosition;
use App\Services\Latra\LatraClient;
use App\Services\Latra\LatraResponse;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SendLatraPositionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'latra.enabled'           => true,
            'latra.base_url'          => 'http://41.59.57.137:8090',
            'latra.endpoint'          => '/data-integration/integration/gps',
            'latra.username'          => 'test_user',
            'latra.password'          => 'test_pass',
            'latra.speed_cap'         => 90,
            'latra.expected_interval' => 30,
            'latra.hard_fault_io_id'  => null,
            'latra.hard_fault_values' => [1, 2],
            'latra.activity_id_tamper'=> 14,
            'latra.activity_map'      => ['default' => 1],
            'latra.io_keys'           => [
                'hdop' => null, 'rssi' => null,
                'mcc'  => null, 'lac'  => null, 'cell_id' => null,
            ],
        ]);
    }

    // ── Guard ─────────────────────────────────────────────────────────────────

    public function test_job_exits_early_when_latra_disabled(): void
    {
        config(['latra.enabled' => false]);

        $client = Mockery::mock(LatraClient::class);
        $client->shouldNotReceive('sendPayload');
        $this->app->instance(LatraClient::class, $client);

        $device   = Device::factory()->create();
        $position = DevicePosition::factory()->create(['device_id' => $device->id]);

        (new SendLatraPosition($position->id))->handle(
            $this->app->make(LatraClient::class),
            $this->app->make(\App\Services\Latra\LatraPayloadBuilder::class),
            $this->app->make(\App\Services\Latra\LatraSanitizer::class),
            $this->app->make(\App\Services\Latra\LatraInterpolator::class),
            $this->app->make(\App\Services\Latra\LatraBuffer::class),
        );

        // No assertions on DB needed — test passes if sendPayload was never called
        $this->assertTrue(true);
    }

    // ── Batching ──────────────────────────────────────────────────────────────

    public function test_buffer_does_not_flush_until_3_items(): void
    {
        $client = Mockery::mock(LatraClient::class);
        $client->shouldNotReceive('sendPayload');
        $this->app->instance(LatraClient::class, $client);

        $device = Device::factory()->create();
        $base   = Carbon::create(2026, 3, 24, 12, 0, 0, 'UTC');

        // Dispatch one position — buffer = 1, should not flush
        $p1 = DevicePosition::factory()->create([
            'device_id'   => $device->id,
            'recorded_at' => $base,
            'speed'       => 50,
        ]);

        $this->dispatchJob($p1->id);

        $this->assertDatabaseCount('latra_buffer', 1);
    }

    public function test_buffer_flushes_on_third_position(): void
    {
        $successResponse = new LatraResponse(true, ['status' => '1'], 200);

        $client = Mockery::mock(LatraClient::class);
        $client->shouldReceive('sendPayload')
            ->once()
            ->withArgs(function (array $payload) {
                return count($payload['items']) === 3
                    && $payload['type'] === 'poi';
            })
            ->andReturn($successResponse);
        $this->app->instance(LatraClient::class, $client);

        $device = Device::factory()->create();
        $base   = Carbon::create(2026, 3, 24, 12, 0, 0, 'UTC');

        // Create and process 3 consecutive positions 10 seconds apart (no gap-filling)
        $p1 = DevicePosition::factory()->create([
            'device_id'   => $device->id,
            'recorded_at' => $base,
            'speed'       => 50,
        ]);
        $p2 = DevicePosition::factory()->create([
            'device_id'   => $device->id,
            'recorded_at' => $base->addSeconds(10),
            'speed'       => 55,
        ]);
        $p3 = DevicePosition::factory()->create([
            'device_id'   => $device->id,
            'recorded_at' => $base->addSeconds(20),
            'speed'       => 60,
        ]);

        $this->dispatchJob($p1->id);
        $this->dispatchJob($p2->id);
        $this->dispatchJob($p3->id);

        // Buffer should be empty after batch was sent
        $this->assertDatabaseCount('latra_buffer', 0);
    }

    // ── Speed cap ─────────────────────────────────────────────────────────────

    public function test_speed_is_capped_at_90_in_payload(): void
    {
        // Pre-populate the buffer with 2 items so the 3rd triggers a flush.
        $device = Device::factory()->create();
        $base   = Carbon::create(2026, 3, 24, 12, 0, 0, 'UTC');

        $p1 = DevicePosition::factory()->create(['device_id' => $device->id, 'recorded_at' => $base, 'speed' => 50]);
        $p2 = DevicePosition::factory()->create(['device_id' => $device->id, 'recorded_at' => $base->addSeconds(10), 'speed' => 50]);
        $this->dispatchJob($p1->id);
        $this->dispatchJob($p2->id);

        // Third position with speed > 90
        $capturedPayload = null;
        $client = Mockery::mock(LatraClient::class);
        $client->shouldReceive('sendPayload')
            ->once()
            ->withArgs(function (array $payload) use (&$capturedPayload) {
                $capturedPayload = $payload;
                return true;
            })
            ->andReturn(new LatraResponse(true, ['status' => '1'], 200));
        $this->app->instance(LatraClient::class, $client);

        $p3 = DevicePosition::factory()->create([
            'device_id'   => $device->id,
            'recorded_at' => $base->addSeconds(20),
            'speed'       => 150,
        ]);
        $this->dispatchJob($p3->id);

        $this->assertNotNull($capturedPayload);
        $speeds = array_column($capturedPayload['items'], 'horizontal_speed');
        foreach ($speeds as $speed) {
            $this->assertLessThanOrEqual(90, $speed);
        }
    }

    // ── Gap-filling ───────────────────────────────────────────────────────────

    public function test_ghost_items_are_added_to_buffer_on_large_gap(): void
    {
        $client = Mockery::mock(LatraClient::class);
        // May or may not flush depending on ghost + real count, just verify it doesn't crash
        $client->shouldReceive('sendPayload')->andReturn(new LatraResponse(true, ['status' => '1'], 200));
        $this->app->instance(LatraClient::class, $client);

        $device = Device::factory()->create();
        $base   = Carbon::create(2026, 3, 24, 12, 0, 0, 'UTC');

        // First position
        $p1 = DevicePosition::factory()->create([
            'device_id'   => $device->id,
            'recorded_at' => $base,
        ]);
        $this->dispatchJob($p1->id);

        // Second position 90 seconds later — should produce 2 ghost items
        $p2 = DevicePosition::factory()->create([
            'device_id'   => $device->id,
            'recorded_at' => $base->addSeconds(90),
        ]);
        $this->dispatchJob($p2->id);

        // After p1 (1 real) and p2 (2 ghosts + 1 real = 3 total), buffer hit 4
        // (1 from p1, already alone; then 2 ghosts + 1 real = 3 more = 4 total before any flush)
        // The batch sent should be the first multiple of 3 = 3
        // 1 item should remain in the buffer
        $this->assertDatabaseCount('latra_buffer', 1);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function dispatchJob(int $positionId): void
    {
        (new SendLatraPosition($positionId))->handle(
            $this->app->make(LatraClient::class),
            $this->app->make(\App\Services\Latra\LatraPayloadBuilder::class),
            $this->app->make(\App\Services\Latra\LatraSanitizer::class),
            $this->app->make(\App\Services\Latra\LatraInterpolator::class),
            $this->app->make(\App\Services\Latra\LatraBuffer::class),
        );
    }
}
