<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $clinic = Clinic::factory();

        return [
            'clinic_id' => $clinic,
            'patient_id' => Patient::factory()->for($clinic),
            'user_id' => User::factory()->for($clinic),
            'appointment_date' => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'start_time' => fake()->time('H:i:00'),
            'end_time' => fake()->optional()->time('H:i:00'),
            'reason' => fake()->optional()->sentence(),
            'status' => 'scheduled',
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
