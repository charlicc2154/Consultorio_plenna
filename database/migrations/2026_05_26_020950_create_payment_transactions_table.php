<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('transaction_date');
            $table->decimal('amount', 10, 2);
            $table->enum('method', ['cash', 'qr', 'card', 'bank_transfer', 'other'])->default('cash')->index();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['confirmed', 'cancelled', 'refunded'])->default('confirmed')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('clinic_id');
            $table->index('payment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
