<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('widget_primary_color', 20)->default('#4f46e5')->after('api_key');
            $table->string('widget_position', 20)->default('bottom-right')->after('widget_primary_color');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['widget_primary_color', 'widget_position']);
        });
    }
};
