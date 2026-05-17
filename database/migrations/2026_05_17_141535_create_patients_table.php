<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('document_type')->nullable();
            $table->string('document_number')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('blood_type')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_notes')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('clinic_id');
            $table->index(['document_type', 'document_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
