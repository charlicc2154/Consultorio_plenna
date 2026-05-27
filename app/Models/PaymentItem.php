<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'payment_id',
        'service_id',
        'service_name',
        'service_type',
        'quantity',
        'unit_price',
        'discount',
        'total',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (PaymentItem $item): void {
            $item->total = max(((int) $item->quantity * (float) $item->unit_price) - (float) $item->discount, 0);
        });

        static::saved(fn (PaymentItem $item) => $item->payment?->recalculateTotals());
        static::deleted(fn (PaymentItem $item) => $item->payment?->recalculateTotals());
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
