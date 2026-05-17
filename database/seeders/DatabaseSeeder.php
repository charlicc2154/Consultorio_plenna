<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $clinic = Clinic::factory()->create([
            'name' => 'Consultorio Central',
            'legal_name' => 'Consultorio Central S.R.L.',
            'status' => 'active',
        ]);

        $admin = User::factory()->for($clinic)->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
        ]);

        Patient::factory()
            ->count(5)
            ->for($clinic)
            ->create()
            ->each(function (Patient $patient) use ($admin, $clinic): void {
                $appointment = $patient->appointments()->create([
                    'clinic_id' => $clinic->id,
                    'user_id' => $admin->id,
                    'appointment_date' => now()->addDays(fake()->numberBetween(1, 10))->toDateString(),
                    'start_time' => fake()->time('H:i:00'),
                    'status' => 'scheduled',
                    'reason' => fake()->sentence(),
                ]);

                $patient->clinicalHistories()->create([
                    'clinic_id' => $clinic->id,
                    'user_id' => $admin->id,
                    'appointment_id' => $appointment->id,
                    'consultation_date' => now()->toDateString(),
                    'reason_for_visit' => fake()->paragraph(),
                    'diagnosis' => fake()->sentence(),
                ]);
            });
    }
}
