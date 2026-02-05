<?php

use App\Models\Company;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('api_key', 64)->unique()->nullable()->after('id');
        });

        Schema::table('company_documents', function (Blueprint $table) {
            $table->longText('extracted_text')->nullable()->after('file_size');
        });

        Company::whereNull('api_key')->each(function (Company $c) {
            $c->update(['api_key' => 'ck_' . Str::random(40)]);
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('api_key');
        });
        Schema::table('company_documents', function (Blueprint $table) {
            $table->dropColumn('extracted_text');
        });
    }
};
