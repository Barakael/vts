<?php

namespace Database\Factories;

use App\Models\Device;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Device>
 */
class DeviceFactory extends Factory
{
    protected $model = Device::class;

    public function definition(): array
    {
        return [
            'name'   => $this->faker->word(),
            'imei'   => $this->faker->numerify('###############'),
            'model'  => 'FMB130',
            'reg_no' => strtoupper(Str::random(3)) . $this->faker->numerify('###'),
            'sim_no' => $this->faker->numerify('255#########'),
        ];
    }
}
