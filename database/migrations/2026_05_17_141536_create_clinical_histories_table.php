<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinical_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('appointment_id')->nullable()->unique()->constrained('appointments')->nullOnDelete();
            $table->date('consultation_date');
            $table->text('reason_for_visit')->nullable();
            $table->text('symptoms')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            $table->text('prescription')->nullable();
            $table->text('observations')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->string('blood_pressure')->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            $table->unsignedInteger('heart_rate')->nullable();
            $table->unsignedInteger('respiratory_rate')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['clinic_id', 'patient_id', 'consultation_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_histories');
    }
};
