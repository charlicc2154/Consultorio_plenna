<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'appointment_id',
        'created_by',
        'payment_number',
        'payment_date',
        'subtotal',
        'discount_total',
        'total',
        'paid_amount',
        'balance',
        'payment_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'balance' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Payment $payment): void {
            if (! $payment->payment_number) {
                $payment->payment_number = self::generatePaymentNumber();
            }
        });
    }

    public static function generatePaymentNumber(): string
    {
        do {
            $number = 'PAY-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (self::where('payment_number', $number)->exists());

        return $number;
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function recalculateTotals(): void
    {
        $subtotal = (float) $this->items()->sum(DB::raw('quantity * unit_price'));
        $discountTotal = (float) $this->items()->sum('discount');
        $total = max($subtotal - $discountTotal, 0);
        $paidAmount = (float) $this->transactions()
            ->where('status', 'confirmed')
            ->sum('amount');
        $balance = max($total - $paidAmount, 0);

        $paymentStatus = match (true) {
            $this->payment_status === 'cancelled' => 'cancelled',
            $paidAmount <= 0 => 'unpaid',
            $paidAmount < $total => 'partial',
            default => 'paid',
        };

        $this->forceFill([
            'subtotal' => $subtotal,
            'discount_total' => $discountTotal,
            'total' => $total,
            'paid_amount' => $paidAmount,
            'balance' => $balance,
            'payment_status' => $paymentStatus,
        ])->save();
    }
}
