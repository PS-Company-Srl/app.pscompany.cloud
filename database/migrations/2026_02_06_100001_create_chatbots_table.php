<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug', 100);
            $table->string('api_key', 64)->unique();
            $table->string('goal_type', 30)->default('assistant');
            $table->text('custom_goal')->nullable();
            $table->string('widget_primary_color', 20)->default('#4f46e5');
            $table->string('widget_position', 20)->default('bottom-right');
            $table->string('widget_icon', 255)->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbots');
    }
};
