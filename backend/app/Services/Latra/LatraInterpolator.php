<?php

namespace App\Services\Latra;

use App\Models\DevicePosition;

/**
 * Generates "ghost" LATRA items to fill temporal gaps between two consecutive
 * position records, maintaining a continuous data stream for SUMATRA/LATRA.
 *
 * One ghost point is inserted for every `expected_interval` seconds of gap,
 * starting at prev + interval and stopping before curr.
 * Lat/lng are linearly interpolated; speed is derived from the straight-line
 * distance between the two real positions.
 */
class LatraInterpolator
{
    /**
     * Return an array of ghost item arrays for any gap > expected_interval.
     * Returns an empty array when the gap is within tolerance.
     *
     * @return array<int, array<string, mixed>>
     */
    public function interpolate(DevicePosition $prev, DevicePosition $curr): array
    {
        $interval   = (int) config('latra.expected_interval', 30);
        $cap        = (int) config('latra.speed_cap', 90);
        // abs() guards against Carbon 3.x returning a negative value when the
        // caller is the later datetime (absolute default flipped in Carbon 3).
        $gapSeconds = (int) abs($curr->recorded_at->diffInSeconds($prev->recorded_at));

        if ($gapSeconds <= $interval) {
            return [];
        }

        $derivedKmh = min($this->haversineKmh($prev, $curr, $gapSeconds), $cap);

        $ghosts = [];
        for ($step = 1; ($step * $interval) < $gapSeconds; $step++) {
            $fraction  = ($step * $interval) / $gapSeconds;
            $lat       = $prev->latitude  + ($curr->latitude  - $prev->latitude)  * $fraction;
            $lng       = $prev->longitude + ($curr->longitude - $prev->longitude) * $fraction;
            $timestampMs = (int) ($prev->recorded_at->getTimestampMs() + ($step * $interval * 1000));

            $ghosts[] = [
                'latitude'         => round($lat, 6),
                'longitude'        => round($lng, 6),
                'time'             => $timestampMs,
                'horizontal_speed' => round($derivedKmh, 2),
                'bearing'          => (int) ($prev->angle ?? 0),
                'altitude'         => (int) ($prev->altitude ?? 0),
                'satellite_count'  => (int) ($prev->satellites ?? 0),
                'hdop'             => null,
                'rssi'             => null,
                'mcc'              => null,
                'lac'              => null,
                'cell_id'          => null,
                'mgs_id'           => $this->ghostId((int) $prev->device_id, $timestampMs),
                'activity_id'      => 1,
            ];
        }

        return $ghosts;
    }

    /**
     * Straight-line speed between two positions using the Haversine formula.
     */
    private function haversineKmh(DevicePosition $from, DevicePosition $to, int $gapSeconds): float
    {
        if ($gapSeconds === 0) {
            return 0.0;
        }

        $R     = 6371.0; // Earth radius km
        $dLat  = deg2rad($to->latitude  - $from->latitude);
        $dLng  = deg2rad($to->longitude - $from->longitude);
        $fromLat = deg2rad($from->latitude);
        $toLat   = deg2rad($to->latitude);

        $a = sin($dLat / 2) ** 2
           + cos($fromLat) * cos($toLat) * sin($dLng / 2) ** 2;

        $distanceKm = 2 * $R * asin(sqrt($a));

        return ($distanceKm / $gapSeconds) * 3600;
    }

    /**
     * Deterministic integer ID for a ghost point (no DB row backing it).
     * Uses a 31-bit positive CRC so it never collides with real auto-increment IDs
     * (which start at 1 and will not reach 2^31).
     */
    private function ghostId(int $deviceId, int $timestampMs): int
    {
        return abs(crc32($deviceId . ':' . $timestampMs));
    }
}
