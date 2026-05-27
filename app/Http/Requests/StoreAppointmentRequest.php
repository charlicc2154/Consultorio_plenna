<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clinic_id' => ['required', 'exists:clinics,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'appointment_date' => ['required', 'date'],
            'start_time' => [
                'required',
                'date_format:H:i',
                Rule::unique('appointments', 'start_time')
                    ->where(fn ($query) => $query
                        ->where('patient_id', $this->input('patient_id'))
                        ->whereDate('appointment_date', $this->input('appointment_date'))
                        ->whereNull('deleted_at')),
            ],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'reason' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['scheduled', 'confirmed', 'completed', 'served', 'cancelled', 'no_show'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}
