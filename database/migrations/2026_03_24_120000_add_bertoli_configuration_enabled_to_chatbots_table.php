<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chatbots', function (Blueprint $table): void {
            $table->boolean('bertoli_configuration_enabled')->default(false)->after('custom_goal');
        });
    }

    public function down(): void
    {
        Schema::table('chatbots', function (Blueprint $table): void {
            $table->dropColumn('bertoli_configuration_enabled');
        });
    }
};
