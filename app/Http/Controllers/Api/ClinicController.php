<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use Illuminate\Http\JsonResponse;

class ClinicController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Clinics retrieved successfully.',
            'data' => Clinic::query()->orderBy('name')->get(),
        ]);
    }
}
