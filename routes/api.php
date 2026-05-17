<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ClinicalHistoryController;
use App\Http\Controllers\Api\ClinicController;
use App\Http\Controllers\Api\PatientController;
use Illuminate\Support\Facades\Route;

Route::apiResource('admin-users', AdminUserController::class);
Route::get('clinics', [ClinicController::class, 'index']);
Route::apiResource('patients', PatientController::class);
Route::apiResource('appointments', AppointmentController::class);
Route::apiResource('clinical-histories', ClinicalHistoryController::class);
