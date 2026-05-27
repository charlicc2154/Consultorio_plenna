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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['consultation', 'laboratory', 'procedure', 'other'])->default('consultation')->index();
            $table->decimal('price', 10, 2);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('clinic_id');
        });

        DB::table('services')->insert([
            [
                'clinic_id' => 1,
                'name' => 'Ecografía Renal',
                'description' => 'Estudio ecográfico renal',
                'type' => 'laboratory',
                'price' => 150.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => 1,
                'name' => 'Ecografía Mamaria',
                'description' => 'Estudio ecográfico mamario',
                'type' => 'laboratory',
                'price' => 180.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => 1,
                'name' => 'Ecografía Abdominal',
                'description' => 'Ecografía abdominal completa',
                'type' => 'laboratory',
                'price' => 200.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => 1,
                'name' => 'Consulta General',
                'description' => 'Consulta médica general',
                'type' => 'consultation',
                'price' => 100.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
