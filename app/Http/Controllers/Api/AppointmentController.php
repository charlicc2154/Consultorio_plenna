<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;

class AppointmentController extends Controller
{
    public function index(): JsonResponse
    {
        $appointments = Appointment::query()
            ->with(['clinic', 'patient', 'user'])
            ->orderByDesc('appointment_date')
            ->orderBy('start_time')
            ->paginate();

        return response()->json([
            'message' => 'Appointments retrieved successfully.',
            'data' => $appointments,
        ]);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = Appointment::create($request->validated());

        return response()->json([
            'message' => 'Appointment created successfully.',
            'data' => $appointment->load(['clinic', 'patient', 'user']),
        ], 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json([
            'message' => 'Appointment retrieved successfully.',
            'data' => $appointment->load(['clinic', 'patient', 'user', 'clinicalHistory']),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $appointment->update($request->validated());

        return response()->json([
            'message' => 'Appointment updated successfully.',
            'data' => $appointment->refresh()->load(['clinic', 'patient', 'user']),
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully.',
            'data' => [],
        ]);
    }
}
