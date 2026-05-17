<?php

namespace Database\Factories;

use App\Models\ClinicalHistory;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClinicalHistory>
 */
class ClinicalHistoryFactory extends Factory
{
    public function definition(): array
    {
        $clinic = Clinic::factory();

        return [
            'clinic_id' => $clinic,
            'patient_id' => Patient::factory()->for($clinic),
            'user_id' => User::factory()->for($clinic),
            'appointment_id' => null,
            'consultation_date' => fake()->date(),
            'reason_for_visit' => fake()->optional()->paragraph(),
            'symptoms' => fake()->optional()->paragraph(),
            'diagnosis' => fake()->optional()->paragraph(),
            'treatment' => fake()->optional()->paragraph(),
            'prescription' => fake()->optional()->paragraph(),
            'observations' => fake()->optional()->paragraph(),
            'weight' => fake()->optional()->randomFloat(2, 2, 250),
            'height' => fake()->optional()->randomFloat(2, 0.4, 2.3),
            'blood_pressure' => fake()->optional()->numerify('###/##'),
            'temperature' => fake()->optional()->randomFloat(1, 35, 41),
            'heart_rate' => fake()->optional()->numberBetween(40, 180),
            'respiratory_rate' => fake()->optional()->numberBetween(8, 40),
        ];
    }
}
