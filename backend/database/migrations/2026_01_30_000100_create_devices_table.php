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
        Schema::create('devices', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->nullable();
            $table->string('imei')->unique();
            $table->string('model')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('last_fix_at')->nullable();
            $table->decimal('last_latitude', 10, 7)->nullable();
            $table->decimal('last_longitude', 10, 7)->nullable();
            $table->unsignedSmallInteger('last_speed')->nullable();
            $table->unsignedSmallInteger('last_angle')->nullable();
            $table->unsignedTinyInteger('last_satellites')->nullable();
            $table->json('last_payload')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
