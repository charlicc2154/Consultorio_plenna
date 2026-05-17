<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var User|null $adminUser */
        $adminUser = $this->route('admin_user');

        return [
            'clinic_id' => ['nullable', 'exists:clinics,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($adminUser?->id)],
            'password' => ['sometimes', 'required', 'string', 'min:8'],
            'role' => ['sometimes', Rule::in(['admin'])],
            'phone' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
