<?php

use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DevicePositionController;
use Illuminate\Support\Facades\Route;

// Auth routes - need to be web routes for Sanctum sessions
Route::middleware('web')->group(function (): void {
    Route::post('/register', [AuthApiController::class, 'register']);
    Route::post('/login', [AuthApiController::class, 'login']);
    Route::post('/logout', [AuthApiController::class, 'logout']);
    Route::get('/user', [AuthApiController::class, 'user']);
});

// Protected device routes
Route::middleware(['web', 'auth:sanctum'])->group(function (): void {
    // Device CRUD routes
    Route::post('/devices', [DeviceController::class, 'store']);
    Route::put('/devices/{id}', [DeviceController::class, 'update']);
    Route::delete('/devices/{id}', [DeviceController::class, 'destroy']);
});

// Public device routes
Route::middleware('web')->group(function (): void {
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::get('/devices/stats', [DeviceController::class, 'stats']);
    Route::get('/devices/models', [DeviceController::class, 'models']);
    Route::get('/devices/{id}', [DeviceController::class, 'show']);
    Route::get('/devices/imei/{imei}', [DeviceController::class, 'showByImei']);
    Route::get('/device-positions', [DevicePositionController::class, 'all']);
    Route::get('/device-positions/latest', [DevicePositionController::class, 'latest']);
    Route::get('/devices/{device}/positions', [DevicePositionController::class, 'forDevice']);
});