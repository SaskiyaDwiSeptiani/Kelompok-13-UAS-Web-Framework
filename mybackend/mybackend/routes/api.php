<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SeminarController;
use App\Http\Controllers\UserController;

// Public Routes
// =============

// Test endpoint (optional)
Route::get('/register-test', function () {
    return response()->json([
        'message' => 'Test endpoint berhasil!',
        'note' => 'Gunakan POST method untuk register',
        'example_data' => [
            'nama' => 'Saskiya',
            'email' => 'saskiya@example.com',
            'username' => 'saskiya',
            'password' => 'password123',
            'role' => 'mahasiswa',
            'npm' => '20230001',
            'konsentrasi' => 'Rekayasa Perangkat Lunak'
        ]
    ]);
});

// Check availability endpoints
Route::get('/check-username/{username}', [AuthController::class, 'checkUsername']);
Route::get('/check-email/{email}', [AuthController::class, 'checkEmail']);
Route::get('/check-npm/{npm}', [AuthController::class, 'checkNpm']);

// Authentication endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login/npm', [AuthController::class, 'loginWithNpm']); // Tambah login dengan NPM

// Protected Routes (Require Authentication)
// =========================================
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']); // Get current user data

    Route::get('/dosen', [UserController::class, 'getDosen']);

    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'getDashboardData']);
    Route::get('/profile', [DashboardController::class, 'getProfile']);
    Route::get('/seminar/{id}', [DashboardController::class, 'getSeminarDetail']);
    Route::get('/kuota', [DashboardController::class, 'getKuotaInfo']);

    // Seminar management routes
    Route::prefix('seminar')->group(function () {
        Route::post('/', [SeminarController::class, 'store']); // Ajukan seminar (alias: daftar)
        Route::post('/daftar', [SeminarController::class, 'store']); // Alias untuk daftar
        Route::get('/my-seminars', [SeminarController::class, 'getUserSeminars']); // Get user seminars
        Route::patch('/{id}', [SeminarController::class, 'update']); // Update seminar
        Route::delete('/{id}', [SeminarController::class, 'destroy']); // Hapus seminar
    });

    // Review routes
    Route::prefix('review')->group(function () {
        Route::post('/{seminarId}', [ReviewController::class, 'store']); // Submit review
        Route::put('/{id}', [ReviewController::class, 'update']); // Update review
    });
});
