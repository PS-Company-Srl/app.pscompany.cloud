<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\InternalApiController;
use App\Http\Middleware\AuthenticateApiKey;
use App\Http\Middleware\AuthenticateInternalApi;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Prefisso: /api
|
*/

// ================================================
// PUBLIC CHAT API (Widget)
// Autenticazione via X-API-Key header
// ================================================
Route::prefix('chat')->middleware(AuthenticateApiKey::class)->group(function () {
    // Invia messaggio e ricevi risposta
    Route::post('/message', [ChatController::class, 'message']);
    
    // Ottieni configurazione widget
    Route::get('/config', [ChatController::class, 'config']);
    
    // Storico conversazione
    Route::get('/history/{session_id}', [ChatController::class, 'history']);
});


// ================================================
// INTERNAL API (chiamate da n8n)
// Autenticazione via X-Internal-Key header
// ================================================
Route::prefix('internal')->middleware(AuthenticateInternalApi::class)->group(function () {
    // Tenant
    Route::post('/tenant/validate', [InternalApiController::class, 'validateTenant']);
    Route::post('/whatsapp/tenant-by-phone', [InternalApiController::class, 'tenantByWhatsappPhone']);
    
    // Conversation
    Route::post('/conversation/context', [InternalApiController::class, 'conversationContext']);
    
    // RAG
    Route::post('/rag/search', [InternalApiController::class, 'ragSearch']);
    
    // Messages
    Route::post('/message/save', [InternalApiController::class, 'saveMessage']);
    
    // Leads
    Route::post('/lead/create', [InternalApiController::class, 'createLead']);
});


// ================================================
// HEALTH CHECK
// ================================================
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});
