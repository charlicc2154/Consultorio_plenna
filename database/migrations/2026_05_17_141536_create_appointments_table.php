<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('reason')->nullable();
            $table->enum('status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])->default('scheduled')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['patient_id', 'appointment_date', 'start_time'], 'appointments_patient_datetime_unique');
            $table->index(['clinic_id', 'appointment_date', 'start_time']);
            $table->index('patient_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
