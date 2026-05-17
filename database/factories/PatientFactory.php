<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'document_type' => fake()->optional()->randomElement(['id_card', 'passport']),
            'document_number' => fake()->optional()->numerify('########'),
            'birth_date' => fake()->optional()->date(),
            'gender' => fake()->optional()->randomElement(['male', 'female', 'other']),
            'phone' => fake()->optional()->phoneNumber(),
            'email' => fake()->optional()->safeEmail(),
            'address' => fake()->optional()->address(),
            'emergency_contact_name' => fake()->optional()->name(),
            'emergency_contact_phone' => fake()->optional()->phoneNumber(),
            'blood_type' => fake()->optional()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'allergies' => fake()->optional()->sentence(),
            'medical_notes' => fake()->optional()->paragraph(),
            'is_active' => true,
        ];
    }
}
