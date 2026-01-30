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
        Schema::create('device_positions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->timestamp('recorded_at');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->integer('altitude')->nullable();
            $table->unsignedSmallInteger('speed')->nullable();
            $table->unsignedSmallInteger('angle')->nullable();
            $table->unsignedTinyInteger('satellites')->nullable();
            $table->unsignedTinyInteger('priority')->nullable();
            $table->string('event_id')->nullable();
            $table->json('io')->nullable();
            $table->text('raw_payload')->nullable();
            $table->timestamps();

            $table->index(['device_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_positions');
    }
};
