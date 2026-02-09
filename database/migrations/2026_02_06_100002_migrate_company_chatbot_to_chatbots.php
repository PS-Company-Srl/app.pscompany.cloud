<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $companies = DB::table('companies')->get();

        foreach ($companies as $company) {
            DB::table('chatbots')->insert([
                'company_id' => $company->id,
                'name' => $company->name,
                'slug' => 'default',
                'api_key' => $company->api_key ?? 'ck_' . Str::random(40),
                'goal_type' => 'assistant',
                'widget_primary_color' => $company->widget_primary_color ?? '#4f46e5',
                'widget_position' => $company->widget_position ?? 'bottom-right',
                'widget_icon' => $company->widget_icon,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'api_key',
                'widget_primary_color',
                'widget_position',
                'widget_icon',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('api_key', 64)->unique()->nullable()->after('address');
            $table->string('widget_primary_color', 20)->default('#4f46e5')->after('api_key');
            $table->string('widget_position', 20)->default('bottom-right')->after('widget_primary_color');
            $table->string('widget_icon', 255)->nullable()->after('widget_position');
        });

        Schema::dropIfExists('chatbots');
    }
};
