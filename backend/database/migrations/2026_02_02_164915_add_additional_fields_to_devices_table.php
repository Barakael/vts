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
        Schema::table('devices', function (Blueprint $table) {
            $table->string('reg_no')->nullable()->after('name');
            $table->string('sim_no')->nullable()->after('reg_no');
            $table->unsignedBigInteger('updated_by')->nullable()->after('last_payload');
            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['reg_no', 'sim_no', 'updated_by']);
        });
    }
};
