<?php

use App\Http\Controllers\Admin\ChatbotController as AdminChatbotController;
use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\CompanyDocumentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Customer\ChatbotController as CustomerChatbotController;
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
    Route::post('companies/{company}/sync-website', [CompanyController::class, 'syncWebsite'])
        ->name('companies.sync-website');
    Route::post('companies/{company}/documents', [CompanyDocumentController::class, 'store'])
        ->name('companies.documents.store');
    Route::delete('companies/{company}/documents/{document}', [CompanyDocumentController::class, 'destroy'])
        ->name('companies.documents.destroy');
    Route::resource('companies.chatbots', AdminChatbotController::class)->names('companies.chatbots')->scoped();
    Route::resource('companies', CompanyController::class)->names('companies');
});

Route::middleware(['auth', 'customer', 'company'])->prefix('dashboard')->name('customer.')->group(function () {
    Route::get('/', [CustomerDashboardController::class, 'index'])->name('dashboard');
    Route::resource('chatbots', CustomerChatbotController::class)->names('chatbots');
});
