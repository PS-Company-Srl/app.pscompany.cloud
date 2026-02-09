<?php

use App\Http\Controllers\Api\ChatController;
use App\Http\Middleware\ValidateChatbotApiKey;
use Illuminate\Support\Facades\Route;

Route::middleware(ValidateChatbotApiKey::class)->prefix('chatbot')->group(function () {
    Route::get('config', [ChatController::class, 'config']);
    Route::post('message', [ChatController::class, 'message']);
});
