<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
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
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'created_by' => ['nullable', 'exists:users,id'],
            'payment_number' => ['nullable', 'string', 'max:255', 'unique:payments,payment_number'],
            'payment_date' => ['required', 'date'],
            'payment_status' => ['sometimes', Rule::in(['unpaid', 'partial', 'paid', 'cancelled'])],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.clinic_id' => ['nullable', 'exists:clinics,id'],
            'items.*.service_id' => ['nullable', 'exists:services,id'],
            'items.*.service_name' => ['required_without:items.*.service_id', 'string', 'max:255'],
            'items.*.service_type' => ['required_without:items.*.service_id', Rule::in(['consultation', 'laboratory', 'procedure', 'other'])],
            'items.*.quantity' => ['sometimes', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_without:items.*.service_id', 'numeric', 'min:0'],
            'items.*.discount' => ['sometimes', 'numeric', 'min:0'],
            'items.*.status' => ['sometimes', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'items.*.notes' => ['nullable', 'string'],
            'initial_payment' => ['nullable', 'array'],
            'initial_payment.received_by' => ['nullable', 'exists:users,id'],
            'initial_payment.transaction_date' => ['nullable', 'date'],
            'initial_payment.amount' => ['required_with:initial_payment', 'numeric', 'min:0.01'],
            'initial_payment.method' => ['required_with:initial_payment', Rule::in(['cash', 'qr', 'card', 'bank_transfer', 'other'])],
            'initial_payment.reference' => ['nullable', 'string', 'max:255'],
            'initial_payment.notes' => ['nullable', 'string'],
            'initial_payment.status' => ['sometimes', Rule::in(['confirmed', 'cancelled', 'refunded'])],
        ];
    }
}
