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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('clinic_id')->nullable()->after('id')->constrained('clinics')->nullOnDelete();
            $table->enum('role', ['admin'])->default('admin')->after('password')->index();
            $table->string('phone')->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('phone')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['clinic_id']);
            $table->dropColumn([
                'clinic_id',
                'role',
                'phone',
                'is_active',
            ]);
        });
    }
};
