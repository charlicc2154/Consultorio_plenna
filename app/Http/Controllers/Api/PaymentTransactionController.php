<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentTransactionRequest;
use App\Http\Requests\UpdatePaymentTransactionRequest;
use App\Models\Payment;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;

class PaymentTransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = PaymentTransaction::query()
            ->with(['clinic', 'payment.patient', 'receiver'])
            ->latest('transaction_date')
            ->latest()
            ->paginate();

        return response()->json([
            'message' => 'Payment transactions retrieved successfully.',
            'data' => $transactions,
        ]);
    }

    public function store(StorePaymentTransactionRequest $request): JsonResponse
    {
        $transaction = PaymentTransaction::create($request->validated());

        return response()->json([
            'message' => 'Payment transaction created successfully.',
            'data' => $transaction->load(['clinic', 'payment', 'receiver']),
        ], 201);
    }

    public function show(PaymentTransaction $paymentTransaction): JsonResponse
    {
        return response()->json([
            'message' => 'Payment transaction retrieved successfully.',
            'data' => $paymentTransaction->load(['clinic', 'payment.patient', 'receiver']),
        ]);
    }

    public function update(UpdatePaymentTransactionRequest $request, PaymentTransaction $paymentTransaction): JsonResponse
    {
        $previousPaymentId = $paymentTransaction->payment_id;

        $paymentTransaction->update($request->validated());

        if ($previousPaymentId !== $paymentTransaction->payment_id) {
            Payment::find($previousPaymentId)?->recalculateTotals();
        }

        return response()->json([
            'message' => 'Payment transaction updated successfully.',
            'data' => $paymentTransaction->refresh()->load(['clinic', 'payment', 'receiver']),
        ]);
    }

    public function destroy(PaymentTransaction $paymentTransaction): JsonResponse
    {
        $paymentTransaction->delete();

        return response()->json([
            'message' => 'Payment transaction deleted successfully.',
            'data' => [],
        ]);
    }
}
