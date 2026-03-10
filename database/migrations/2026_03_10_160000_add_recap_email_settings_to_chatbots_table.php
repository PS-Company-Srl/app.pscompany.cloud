<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chatbots', function (Blueprint $table) {
            $table->boolean('recap_email_enabled')->default(false)->after('widget_auto_open_after_seconds');
            $table->unsignedSmallInteger('recap_email_delay_minutes')->default(30)->after('recap_email_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('chatbots', function (Blueprint $table) {
            $table->dropColumn(['recap_email_enabled', 'recap_email_delay_minutes']);
        });
    }
};
