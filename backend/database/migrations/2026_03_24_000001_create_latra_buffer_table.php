<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('latra_buffer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->json('payload_item');
            $table->boolean('is_ghost')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['device_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('latra_buffer');
    }
};
