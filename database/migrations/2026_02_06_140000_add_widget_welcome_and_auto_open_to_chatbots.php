<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chatbots', function (Blueprint $table) {
            $table->text('widget_welcome_message')->nullable()->after('widget_icon');
            $table->unsignedSmallInteger('widget_auto_open_after_seconds')->default(20)->after('widget_welcome_message');
        });
    }

    public function down(): void
    {
        Schema::table('chatbots', function (Blueprint $table) {
            $table->dropColumn(['widget_welcome_message', 'widget_auto_open_after_seconds']);
        });
    }
};
