<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    public function index(): JsonResponse
    {
        $patients = Patient::query()
            ->with('clinic')
            ->latest()
            ->paginate();

        return response()->json([
            'message' => 'Patients retrieved successfully.',
            'data' => $patients,
        ]);
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = Patient::create($request->validated());

        return response()->json([
            'message' => 'Patient created successfully.',
            'data' => $patient->load('clinic'),
        ], 201);
    }

    public function show(Patient $patient): JsonResponse
    {
        return response()->json([
            'message' => 'Patient retrieved successfully.',
            'data' => $patient->load(['clinic', 'appointments', 'clinicalHistories']),
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $patient->update($request->validated());

        return response()->json([
            'message' => 'Patient updated successfully.',
            'data' => $patient->refresh()->load('clinic'),
        ]);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json([
            'message' => 'Patient deleted successfully.',
            'data' => [],
        ]);
    }
}
