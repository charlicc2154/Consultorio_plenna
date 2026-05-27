<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ClinicalHistoryController;
use App\Http\Controllers\Api\ClinicController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentTransactionController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::apiResource('admin-users', AdminUserController::class);
Route::get('clinics', [ClinicController::class, 'index']);
Route::apiResource('patients', PatientController::class);
Route::apiResource('appointments', AppointmentController::class);
Route::apiResource('clinical-histories', ClinicalHistoryController::class);
Route::apiResource('services', ServiceController::class);
Route::apiResource('payments', PaymentController::class);
Route::apiResource('payment-transactions', PaymentTransactionController::class);
