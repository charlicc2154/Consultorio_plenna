<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_be_created_and_listed(): void
    {
        $clinic = Clinic::factory()->create();

        $response = $this->postJson('/api/patients', [
            'clinic_id' => $clinic->id,
            'first_name' => 'Maria',
            'last_name' => 'Lopez',
            'document_type' => 'id_card',
            'document_number' => '1234567',
            'gender' => 'female',
            'phone' => '+591 70000000',
            'is_active' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Patient created successfully.')
            ->assertJsonPath('data.first_name', 'Maria');

        $this->getJson('/api/patients')
            ->assertOk()
            ->assertJsonPath('message', 'Patients retrieved successfully.');
    }

    public function test_patient_cannot_have_two_appointments_at_the_same_date_and_time(): void
    {
        $clinic = Clinic::factory()->create();
        $patient = Patient::factory()->for($clinic)->create();
        $admin = User::factory()->for($clinic)->create();

        Appointment::factory()->for($clinic)->for($patient)->for($admin, 'user')->create([
            'appointment_date' => '2026-05-20',
            'start_time' => '09:00',
        ]);

        $response = $this->postJson('/api/appointments', [
            'clinic_id' => $clinic->id,
            'patient_id' => $patient->id,
            'user_id' => $admin->id,
            'appointment_date' => '2026-05-20',
            'start_time' => '09:00',
            'status' => 'scheduled',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('start_time');
    }

    public function test_clinical_history_can_be_created_for_an_appointment(): void
    {
        $clinic = Clinic::factory()->create();
        $patient = Patient::factory()->for($clinic)->create();
        $admin = User::factory()->for($clinic)->create();
        $appointment = Appointment::factory()->for($clinic)->for($patient)->for($admin, 'user')->create([
            'appointment_date' => '2026-05-20',
            'start_time' => '10:00',
        ]);

        $response = $this->postJson('/api/clinical-histories', [
            'clinic_id' => $clinic->id,
            'patient_id' => $patient->id,
            'user_id' => $admin->id,
            'appointment_id' => $appointment->id,
            'consultation_date' => '2026-05-20',
            'reason_for_visit' => 'Routine checkup',
            'diagnosis' => 'Healthy patient',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Clinical history created successfully.')
            ->assertJsonPath('data.diagnosis', 'Healthy patient');
    }
}
