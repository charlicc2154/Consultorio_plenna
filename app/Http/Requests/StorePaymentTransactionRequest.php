<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clinic_id' => ['required', 'exists:clinics,id'],
            'payment_id' => ['required', 'exists:payments,id'],
            'received_by' => ['nullable', 'exists:users,id'],
            'transaction_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', Rule::in(['cash', 'qr', 'card', 'bank_transfer', 'other'])],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['confirmed', 'cancelled', 'refunded'])],
        ];
    }
}
