<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClinicalHistoryRequest extends FormRequest
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
            'appointment_id' => ['nullable', 'exists:appointments,id', Rule::unique('clinical_histories', 'appointment_id')->whereNull('deleted_at')],
            'consultation_date' => ['required', 'date'],
            'reason_for_visit' => ['nullable', 'string'],
            'symptoms' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'treatment' => ['nullable', 'string'],
            'prescription' => ['nullable', 'string'],
            'observations' => ['nullable', 'string'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'height' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'blood_pressure' => ['nullable', 'string', 'max:255'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:99.9'],
            'heart_rate' => ['nullable', 'integer', 'min:0'],
            'respiratory_rate' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
