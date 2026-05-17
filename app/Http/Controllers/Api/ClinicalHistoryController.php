<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClinicalHistoryRequest;
use App\Http\Requests\UpdateClinicalHistoryRequest;
use App\Models\ClinicalHistory;
use Illuminate\Http\JsonResponse;

class ClinicalHistoryController extends Controller
{
    public function index(): JsonResponse
    {
        $clinicalHistories = ClinicalHistory::query()
            ->with(['clinic', 'patient', 'user', 'appointment'])
            ->orderByDesc('consultation_date')
            ->paginate();

        return response()->json([
            'message' => 'Clinical histories retrieved successfully.',
            'data' => $clinicalHistories,
        ]);
    }

    public function store(StoreClinicalHistoryRequest $request): JsonResponse
    {
        $clinicalHistory = ClinicalHistory::create($request->validated());

        return response()->json([
            'message' => 'Clinical history created successfully.',
            'data' => $clinicalHistory->load(['clinic', 'patient', 'user', 'appointment']),
        ], 201);
    }

    public function show(ClinicalHistory $clinicalHistory): JsonResponse
    {
        return response()->json([
            'message' => 'Clinical history retrieved successfully.',
            'data' => $clinicalHistory->load(['clinic', 'patient', 'user', 'appointment']),
        ]);
    }

    public function update(UpdateClinicalHistoryRequest $request, ClinicalHistory $clinicalHistory): JsonResponse
    {
        $clinicalHistory->update($request->validated());

        return response()->json([
            'message' => 'Clinical history updated successfully.',
            'data' => $clinicalHistory->refresh()->load(['clinic', 'patient', 'user', 'appointment']),
        ]);
    }

    public function destroy(ClinicalHistory $clinicalHistory): JsonResponse
    {
        $clinicalHistory->delete();

        return response()->json([
            'message' => 'Clinical history deleted successfully.',
            'data' => [],
        ]);
    }
}
