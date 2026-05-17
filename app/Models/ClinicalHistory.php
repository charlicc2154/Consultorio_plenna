<?php

namespace App\Models;

use Database\Factories\ClinicalHistoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClinicalHistory extends Model
{
    /** @use HasFactory<ClinicalHistoryFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'user_id',
        'appointment_id',
        'consultation_date',
        'reason_for_visit',
        'symptoms',
        'diagnosis',
        'treatment',
        'prescription',
        'observations',
        'weight',
        'height',
        'blood_pressure',
        'temperature',
        'heart_rate',
        'respiratory_rate',
    ];

    protected function casts(): array
    {
        return [
            'consultation_date' => 'date',
            'weight' => 'decimal:2',
            'height' => 'decimal:2',
            'temperature' => 'decimal:1',
            'heart_rate' => 'integer',
            'respiratory_rate' => 'integer',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
