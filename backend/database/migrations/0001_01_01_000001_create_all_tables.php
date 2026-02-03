<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ================================================
        // ADMINS - Utenti PS Company (Super Admin)
        // ================================================
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        // ================================================
        // TENANTS - Clienti/Aziende
        // ================================================
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 100)->unique();
            $table->string('domain')->nullable()->unique();
            $table->string('api_key', 64)->unique();
            
            // WhatsApp Config
            $table->string('whatsapp_phone_id', 50)->nullable();
            $table->string('whatsapp_business_id', 50)->nullable();
            $table->text('whatsapp_access_token')->nullable();
            
            // Settings (JSON)
            $table->json('settings')->nullable();
            
            // Limiti e billing
            $table->unsignedInteger('monthly_message_limit')->default(1000);
            $table->unsignedInteger('messages_used_this_month')->default(0);
            $table->string('plan', 50)->default('starter');
            
            $table->enum('status', ['active', 'suspended', 'trial'])->default('trial');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['slug']);
            $table->index(['api_key']);
            $table->index(['status']);
            $table->index(['whatsapp_phone_id']);
        });

        // ================================================
        // USERS - Utenti Pannello Cliente
        // ================================================
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('password');
            $table->enum('role', ['owner', 'admin', 'viewer'])->default('viewer');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'email']);
            $table->index(['tenant_id']);
        });

        // ================================================
        // BOT SETTINGS - Configurazione Bot per Tenant
        // ================================================
        Schema::create('bot_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->cascadeOnDelete();
            
            // Comportamento AI
            $table->text('system_prompt');
            $table->text('welcome_message')->nullable();
            $table->text('fallback_message')->nullable();
            $table->enum('fallback_action', ['apologize', 'ask_contact', 'transfer'])->default('ask_contact');
            $table->text('lead_goal')->nullable();
            
            // Widget Config
            $table->unsignedInteger('trigger_delay')->default(0);
            $table->text('trigger_message')->nullable();
            $table->enum('widget_position', ['bottom-right', 'bottom-left'])->default('bottom-right');
            $table->json('widget_colors')->nullable();
            
            // OpenAI Config
            $table->string('openai_model', 50)->default('gpt-4o-mini');
            $table->decimal('temperature', 2, 1)->default(0.7);
            $table->unsignedInteger('max_tokens')->default(500);
            
            $table->timestamps();
        });

        // ================================================
        // KNOWLEDGE BASES - Documenti Knowledge Base
        // ================================================
        Schema::create('knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['file', 'text', 'url', 'website_scan']);
            
            // Contenuto originale
            $table->longText('original_content')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->string('source_url', 500)->nullable();
            
            // Metadata
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            
            // Processing status
            $table->enum('status', ['pending', 'processing', 'ready', 'error'])->default('pending');
            $table->unsignedInteger('chunks_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'status']);
        });

        // ================================================
        // KB CHUNKS - Chunks per Embedding/RAG
        // ================================================
        Schema::create('kb_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_base_id')->constrained()->cascadeOnDelete();
            
            $table->text('content');
            $table->string('content_hash', 64);
            
            // Embedding vector (JSON)
            $table->json('embedding')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable();
            $table->unsignedInteger('tokens_count')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['knowledge_base_id']);
            $table->index(['content_hash']);
        });

        // ================================================
        // CONVERSATIONS - Conversazioni
        // ================================================
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            
            $table->enum('channel', ['web', 'whatsapp']);
            $table->string('session_id', 100);
            
            // Info visitatore
            $table->json('visitor_info')->nullable();
            
            // Stato
            $table->enum('status', ['active', 'closed', 'archived'])->default('active');
            $table->boolean('lead_captured')->default(false);
            
            // Metriche
            $table->unsignedInteger('messages_count')->default(0);
            $table->unsignedInteger('total_tokens')->default(0);
            
            $table->timestamp('started_at');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'channel']);
            $table->index(['session_id']);
            $table->index(['tenant_id', 'created_at']);
        });

        // ================================================
        // MESSAGES - Messaggi
        // ================================================
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            
            $table->enum('role', ['user', 'assistant', 'system']);
            $table->text('content');
            
            // Metriche OpenAI
            $table->unsignedInteger('tokens_used')->nullable();
            $table->string('model_used', 50)->nullable();
            
            // Per debugging/analytics
            $table->json('kb_chunks_used')->nullable();
            $table->decimal('confidence_score', 3, 2)->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['conversation_id']);
            $table->index(['created_at']);
        });

        // ================================================
        // LEADS - Lead Acquisiti
        // ================================================
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained()->nullOnDelete();
            
            // Dati lead
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('company')->nullable();
            
            // Contesto
            $table->enum('source', ['web', 'whatsapp']);
            $table->text('notes')->nullable();
            $table->text('interest')->nullable();
            
            // Stato
            $table->enum('status', ['new', 'contacted', 'qualified', 'converted', 'lost'])->default('new');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'created_at']);
        });

        // ================================================
        // ACTIVITY LOGS - Log Attività
        // ================================================
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            
            $table->string('loggable_type', 100);
            $table->unsignedBigInteger('loggable_id');
            
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('action', 100);
            $table->text('description')->nullable();
            $table->json('properties')->nullable();
            
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['loggable_type', 'loggable_id']);
            $table->index(['tenant_id']);
            $table->index(['action']);
            $table->index(['created_at']);
        });

        // ================================================
        // API USAGE - Tracking Utilizzo API
        // ================================================
        Schema::create('api_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            
            $table->date('date');
            
            // Contatori giornalieri
            $table->unsignedInteger('messages_count')->default(0);
            $table->unsignedInteger('tokens_input')->default(0);
            $table->unsignedInteger('tokens_output')->default(0);
            
            // Costi stimati (in centesimi)
            $table->unsignedInteger('estimated_cost_cents')->default(0);
            
            $table->timestamps();
            
            $table->unique(['tenant_id', 'date']);
            $table->index(['tenant_id', 'date']);
        });

        // ================================================
        // LARAVEL STANDARD TABLES
        // ================================================
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('api_usage');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('kb_chunks');
        Schema::dropIfExists('knowledge_bases');
        Schema::dropIfExists('bot_settings');
        Schema::dropIfExists('users');
        Schema::dropIfExists('tenants');
        Schema::dropIfExists('admins');
    }
};
