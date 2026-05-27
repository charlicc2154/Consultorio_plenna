<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $payments = Payment::query()
            ->with(['patient', 'appointment', 'items.service', 'transactions.receiver'])
            ->latest('payment_date')
            ->latest()
            ->paginate();

        return response()->json([
            'message' => 'Payments retrieved successfully.',
            'data' => $payments,
        ]);
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $items = Arr::pull($data, 'items');
        $initialPayment = Arr::pull($data, 'initial_payment');

        $payment = DB::transaction(function () use ($data, $items, $initialPayment): Payment {
            /** @var Payment $payment */
            $payment = Payment::create($data);

            foreach ($items as $item) {
                $payment->items()->create($this->prepareItemPayload($item, $payment));
            }

            if ($initialPayment) {
                $payment->transactions()->create([
                    ...$initialPayment,
                    'clinic_id' => $payment->clinic_id,
                    'transaction_date' => $initialPayment['transaction_date'] ?? $payment->payment_date,
                    'status' => $initialPayment['status'] ?? 'confirmed',
                ]);
            }

            $payment->recalculateTotals();

            return $payment;
        });

        return response()->json([
            'message' => 'Payment created successfully.',
            'data' => $payment->load(['clinic', 'patient', 'appointment', 'creator', 'items.service', 'transactions.receiver']),
        ], 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json([
            'message' => 'Payment retrieved successfully.',
            'data' => $payment->load(['clinic', 'patient', 'appointment', 'creator', 'items.service', 'transactions.receiver']),
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): JsonResponse
    {
        $data = $request->validated();
        $items = Arr::pull($data, 'items');

        DB::transaction(function () use ($payment, $data, $items): void {
            $payment->update($data);

            if ($items !== null) {
                $payment->items()->delete();

                foreach ($items as $item) {
                    $payment->items()->create($this->prepareItemPayload($item, $payment));
                }
            }

            $payment->recalculateTotals();
        });

        return response()->json([
            'message' => 'Payment updated successfully.',
            'data' => $payment->refresh()->load(['clinic', 'patient', 'appointment', 'creator', 'items.service', 'transactions.receiver']),
        ]);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted successfully.',
            'data' => [],
        ]);
    }

    private function prepareItemPayload(array $item, Payment $payment): array
    {
        $service = isset($item['service_id'])
            ? Service::withTrashed()->find($item['service_id'])
            : null;

        $quantity = (int) ($item['quantity'] ?? 1);
        $unitPrice = (float) ($item['unit_price'] ?? $service?->price ?? 0);
        $discount = (float) ($item['discount'] ?? 0);

        return [
            'clinic_id' => $item['clinic_id'] ?? $payment->clinic_id,
            'service_id' => $service?->id,
            'service_name' => $item['service_name'] ?? $service?->name ?? 'Servicio',
            'service_type' => $item['service_type'] ?? $service?->type ?? 'other',
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'discount' => $discount,
            'total' => max(($quantity * $unitPrice) - $discount, 0),
            'status' => $item['status'] ?? 'pending',
            'notes' => $item['notes'] ?? null,
        ];
    }
}
