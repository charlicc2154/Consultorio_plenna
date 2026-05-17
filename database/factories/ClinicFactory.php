<?php

namespace Database\Factories;

use App\Models\Clinic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Clinic>
 */
class ClinicFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'legal_name' => fake()->optional()->company(),
            'phone' => fake()->optional()->phoneNumber(),
            'email' => fake()->optional()->companyEmail(),
            'address' => fake()->optional()->address(),
            'status' => 'active',
        ];
    }
}
