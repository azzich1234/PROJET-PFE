<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

// Public routes (no token needed)
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

// Protected routes (token required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    Route::put('/profile',          [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/avatar',  [ProfileController::class, 'updateAvatar']);
    Route::delete('/profile/avatar',[ProfileController::class, 'removeAvatar']);

    // Admin-only routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users',              [AdminController::class, 'users']);
        Route::patch('/users/{user}/toggle', [AdminController::class, 'toggleActive']);
        Route::post('/users',             [AdminController::class, 'addInstructor']);
        Route::put('/users/{user}',       [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}',    [AdminController::class, 'deleteUser']);
    });
});
