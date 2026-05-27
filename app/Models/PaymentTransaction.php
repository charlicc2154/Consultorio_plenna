<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'payment_id',
        'received_by',
        'transaction_date',
        'amount',
        'method',
        'reference',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn (PaymentTransaction $transaction) => $transaction->payment?->recalculateTotals());
        static::deleted(fn (PaymentTransaction $transaction) => $transaction->payment?->recalculateTotals());
        static::restored(fn (PaymentTransaction $transaction) => $transaction->payment?->recalculateTotals());
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
