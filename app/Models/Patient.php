<?php

namespace App\Models;

use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'first_name',
        'last_name',
        'document_type',
        'document_number',
        'birth_date',
        'gender',
        'phone',
        'email',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'blood_type',
        'allergies',
        'medical_notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function clinicalHistories(): HasMany
    {
        return $this->hasMany(ClinicalHistory::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
