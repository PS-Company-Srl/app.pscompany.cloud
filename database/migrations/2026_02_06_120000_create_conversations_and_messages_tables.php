<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chatbot_id')->constrained()->cascadeOnDelete();
            $table->string('session_id', 100)->index();
            $table->timestamp('started_at')->useCurrent();
            $table->string('email', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->timestamps();

            $table->unique(['chatbot_id', 'session_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20); // user, assistant
            $table->text('content');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
    }
};
