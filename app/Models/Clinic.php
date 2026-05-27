<?php

namespace App\Models;

use Database\Factories\ClinicFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clinic extends Model
{
    /** @use HasFactory<ClinicFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'legal_name',
        'phone',
        'email',
        'address',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function clinicalHistories(): HasMany
    {
        return $this->hasMany(ClinicalHistory::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
