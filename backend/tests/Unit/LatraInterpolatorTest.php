<?php

namespace Tests\Unit;

use App\Models\DevicePosition;
use App\Services\Latra\LatraInterpolator;
use Carbon\CarbonImmutable;
use Tests\TestCase;

class LatraInterpolatorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'latra.expected_interval' => 30,
            'latra.speed_cap'         => 90,
        ]);
    }

    // ── Gap within tolerance ──────────────────────────────────────────────────

    public function test_gap_equal_to_interval_returns_no_ghosts(): void
    {
        [$prev, $curr] = $this->positions(gapSeconds: 30);

        $this->assertEmpty((new LatraInterpolator())->interpolate($prev, $curr));
    }

    public function test_gap_less_than_interval_returns_no_ghosts(): void
    {
        [$prev, $curr] = $this->positions(gapSeconds: 15);

        $this->assertEmpty((new LatraInterpolator())->interpolate($prev, $curr));
    }

    // ── Ghost point count ─────────────────────────────────────────────────────

    public function test_gap_of_60s_produces_one_ghost(): void
    {
        [$prev, $curr] = $this->positions(gapSeconds: 60);

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        $this->assertCount(1, $ghosts);
    }

    public function test_gap_of_90s_produces_two_ghosts(): void
    {
        [$prev, $curr] = $this->positions(gapSeconds: 90);

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        $this->assertCount(2, $ghosts);
    }

    public function test_gap_of_150s_produces_four_ghosts(): void
    {
        [$prev, $curr] = $this->positions(gapSeconds: 150);

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        $this->assertCount(4, $ghosts);
    }

    // ── Interpolation math ────────────────────────────────────────────────────

    public function test_ghost_timestamps_are_spaced_by_interval(): void
    {
        $base           = CarbonImmutable::create(2026, 3, 24, 12, 0, 0, 'UTC');
        [$prev, $curr]  = $this->positions(gapSeconds: 90, base: $base);

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        $this->assertCount(2, $ghosts);
        $this->assertSame((int) $base->addSeconds(30)->getTimestampMs(), $ghosts[0]['time']);
        $this->assertSame((int) $base->addSeconds(60)->getTimestampMs(), $ghosts[1]['time']);
    }

    public function test_ghost_latitudes_are_linearly_interpolated(): void
    {
        $base = CarbonImmutable::create(2026, 3, 24, 12, 0, 0, 'UTC');
        $prev = $this->position(lat: 0.0, lng: 0.0, timestamp: $base);
        $curr = $this->position(lat: 9.0, lng: 0.0, timestamp: $base->addSeconds(90));

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        // At 30/90 = 1/3 fraction: lat = 0 + 9 * (1/3) = 3.0
        $this->assertEqualsWithDelta(3.0, $ghosts[0]['latitude'], 0.001);
        // At 60/90 = 2/3 fraction: lat = 0 + 9 * (2/3) = 6.0
        $this->assertEqualsWithDelta(6.0, $ghosts[1]['latitude'], 0.001);
    }

    public function test_ghost_longitudes_are_linearly_interpolated(): void
    {
        $base = CarbonImmutable::create(2026, 3, 24, 12, 0, 0, 'UTC');
        $prev = $this->position(lat: 0.0, lng: 0.0, timestamp: $base);
        $curr = $this->position(lat: 0.0, lng: 6.0, timestamp: $base->addSeconds(60));

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        // One ghost at t+30: fraction = 0.5, lng = 3.0
        $this->assertCount(1, $ghosts);
        $this->assertEqualsWithDelta(3.0, $ghosts[0]['longitude'], 0.001);
    }

    // ── Speed cap on derived speed ────────────────────────────────────────────

    public function test_derived_speed_exceeding_cap_is_clamped(): void
    {
        // Place two positions very far apart in a short time to force a
        // derived speed well above 90 km/h.
        $base = CarbonImmutable::create(2026, 3, 24, 12, 0, 0, 'UTC');
        $prev = $this->position(lat: -6.0, lng: 39.0, timestamp: $base);
        $curr = $this->position(lat:  6.0, lng: 39.0, timestamp: $base->addSeconds(60));

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        foreach ($ghosts as $ghost) {
            $this->assertLessThanOrEqual(90.0, $ghost['horizontal_speed']);
        }
    }

    // ── Ghost item structure ──────────────────────────────────────────────────

    public function test_ghost_items_have_required_keys(): void
    {
        [$prev, $curr] = $this->positions(gapSeconds: 60);

        $ghost = (new LatraInterpolator())->interpolate($prev, $curr)[0];

        foreach (['latitude', 'longitude', 'time', 'horizontal_speed', 'bearing',
                   'altitude', 'satellite_count', 'mgs_id', 'activity_id'] as $key) {
            $this->assertArrayHasKey($key, $ghost, "Ghost item missing key: $key");
        }
    }

    public function test_ghost_activity_id_defaults_to_1(): void
    {
        [$prev, $curr] = $this->positions(gapSeconds: 60);

        $ghosts = (new LatraInterpolator())->interpolate($prev, $curr);

        $this->assertSame(1, $ghosts[0]['activity_id']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * @return array{DevicePosition, DevicePosition}
     */
    private function positions(int $gapSeconds, ?CarbonImmutable $base = null): array
    {
        $base ??= CarbonImmutable::create(2026, 3, 24, 12, 0, 0, 'UTC');
        $prev   = $this->position(lat: -6.8, lng: 39.2, timestamp: $base);
        $curr   = $this->position(lat: -6.81, lng: 39.21, timestamp: $base->addSeconds($gapSeconds));

        return [$prev, $curr];
    }

    private function position(float $lat, float $lng, CarbonImmutable $timestamp): DevicePosition
    {
        $p = new DevicePosition();
        $p->forceFill([
            'device_id'   => 1,
            'latitude'    => $lat,
            'longitude'   => $lng,
            'speed'       => 50,
            'angle'       => 0,
            'altitude'    => 100,
            'satellites'  => 8,
            'recorded_at' => $timestamp,
            'io'          => ['values' => []],
        ]);

        return $p;
    }
}
