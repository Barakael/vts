<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\DevicePosition;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DevicePosition>
 */
class DevicePositionFactory extends Factory
{
    protected $model = DevicePosition::class;

    public function definition(): array
    {
        return [
            'device_id'   => Device::factory(),
            'recorded_at' => Carbon::now(),
            'latitude'    => (float) $this->faker->latitude(-11, 0),
            'longitude'   => (float) $this->faker->longitude(29, 41),
            'altitude'    => $this->faker->numberBetween(0, 1500),
            'speed'       => $this->faker->numberBetween(0, 80),
            'angle'       => $this->faker->numberBetween(0, 359),
            'satellites'  => $this->faker->numberBetween(4, 12),
            'priority'    => 0,
            'event_id'    => 0,
            'io'          => ['values' => []],
            'raw_payload' => null,
        ];
    }
}
