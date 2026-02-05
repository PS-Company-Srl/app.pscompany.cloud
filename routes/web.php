<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\CompanyDocumentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? (auth()->user()->isAdmin() ? redirect()->route('admin.dashboard') : Inertia::render('Welcome'))
        : redirect()->route('login');
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
    Route::resource('companies', CompanyController::class)->names('companies');
    Route::post('companies/{company}/documents', [CompanyDocumentController::class, 'store'])
        ->name('companies.documents.store');
    Route::delete('companies/{company}/documents/{document}', [CompanyDocumentController::class, 'destroy'])
        ->name('companies.documents.destroy');
});
