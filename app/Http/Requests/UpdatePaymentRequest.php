<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $paymentId = $this->route('payment')?->id;

        return [
            'clinic_id' => ['sometimes', 'required', 'exists:clinics,id'],
            'patient_id' => ['sometimes', 'required', 'exists:patients,id'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'created_by' => ['nullable', 'exists:users,id'],
            'payment_number' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('payments', 'payment_number')->ignore($paymentId)],
            'payment_date' => ['sometimes', 'required', 'date'],
            'payment_status' => ['sometimes', Rule::in(['unpaid', 'partial', 'paid', 'cancelled'])],
            'notes' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'exists:payment_items,id'],
            'items.*.clinic_id' => ['nullable', 'exists:clinics,id'],
            'items.*.service_id' => ['nullable', 'exists:services,id'],
            'items.*.service_name' => ['required_without:items.*.service_id', 'string', 'max:255'],
            'items.*.service_type' => ['required_without:items.*.service_id', Rule::in(['consultation', 'laboratory', 'procedure', 'other'])],
            'items.*.quantity' => ['sometimes', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_without:items.*.service_id', 'numeric', 'min:0'],
            'items.*.discount' => ['sometimes', 'numeric', 'min:0'],
            'items.*.status' => ['sometimes', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'items.*.notes' => ['nullable', 'string'],
        ];
    }
}
