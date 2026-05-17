<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Appointment|null $appointment */
        $appointment = $this->route('appointment');
        $patientId = $this->input('patient_id', $appointment?->patient_id);
        $appointmentDate = $this->input('appointment_date', $appointment?->appointment_date?->toDateString());

        return [
            'clinic_id' => ['sometimes', 'required', 'exists:clinics,id'],
            'patient_id' => ['sometimes', 'required', 'exists:patients,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'appointment_date' => ['sometimes', 'required', 'date'],
            'start_time' => [
                'sometimes',
                'required',
                'date_format:H:i',
                Rule::unique('appointments', 'start_time')
                    ->ignore($appointment?->id)
                    ->where(fn ($query) => $query
                        ->where('patient_id', $patientId)
                        ->whereDate('appointment_date', $appointmentDate)
                        ->whereNull('deleted_at')),
            ],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'reason' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}
