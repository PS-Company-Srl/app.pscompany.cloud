<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('mail_from_address', 255)->nullable()->after('address');
            $table->string('mail_from_name', 255)->nullable()->after('mail_from_address');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['mail_from_address', 'mail_from_name']);
        });
    }
};
