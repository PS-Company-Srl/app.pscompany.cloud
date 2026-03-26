<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_occasion_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('showroom', 50)->nullable();
            $table->string('title', 255);
            $table->string('price_from', 100)->nullable();
            $table->string('price_to', 100)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('source_url', 500)->nullable();
            $table->text('raw_block')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_occasion_items');
    }
};
