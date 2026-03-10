<?php

use App\Http\Controllers\Admin\ChatbotController as AdminChatbotController;
use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\ConversationController as AdminConversationController;
use App\Http\Controllers\Admin\CompanyDocumentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Customer\ChatbotController as CustomerChatbotController;
use App\Http\Controllers\Customer\ConversationController as CustomerConversationController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }
    if (auth()->user()->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }
    if (auth()->user()->isCustomer()) {
        return redirect()->route('customer.dashboard');
    }
    return Inertia::render('Welcome');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('companies/{company}/sync-website', [CompanyController::class, 'syncWebsite'])
        ->name('companies.sync-website');
    Route::post('companies/{company}/documents', [CompanyDocumentController::class, 'store'])
        ->name('companies.documents.store');
    Route::delete('companies/{company}/documents/{document}', [CompanyDocumentController::class, 'destroy'])
        ->name('companies.documents.destroy');
    Route::resource('companies.chatbots', AdminChatbotController::class)->names('companies.chatbots')->scoped();
    Route::get('companies/{company}/chatbots/{chatbot}/conversations', [AdminConversationController::class, 'index'])
        ->name('companies.chatbots.conversations.index');
    Route::get('companies/{company}/chatbots/{chatbot}/conversations/{conversation}', [AdminConversationController::class, 'show'])
        ->name('companies.chatbots.conversations.show');
    Route::get('companies/{company}/recap-emails', [CompanyController::class, 'recapEmails'])
        ->name('companies.recap-emails.index');
    Route::get('companies/{company}/users/create', [CompanyController::class, 'createUser'])
        ->name('companies.users.create');
    Route::post('companies/{company}/users', [CompanyController::class, 'storeUser'])
        ->name('companies.users.store');
    Route::delete('companies/{company}/users/{user}', [CompanyController::class, 'destroyUser'])
        ->name('companies.users.destroy');
    Route::resource('companies', CompanyController::class)->names('companies');
});

Route::middleware(['auth', 'customer', 'company'])->prefix('dashboard')->name('customer.')->group(function () {
    Route::get('/', [CustomerDashboardController::class, 'index'])->name('dashboard');
    Route::get('chatbots/{chatbot}/conversations', [CustomerConversationController::class, 'index'])
        ->name('chatbots.conversations.index');
    Route::get('chatbots/{chatbot}/conversations/{conversation}', [CustomerConversationController::class, 'show'])
        ->name('chatbots.conversations.show');
    Route::resource('chatbots', CustomerChatbotController::class)->names('chatbots');
});
