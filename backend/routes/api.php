<?php

use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DevicePositionController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthApiController::class, 'register']);
Route::post('/login', [AuthApiController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
	Route::post('/logout', [AuthApiController::class, 'logout']);
	Route::get('/user', [AuthApiController::class, 'user']);
});

// Device routes - PUBLIC (no auth required)
Route::get('/devices', [DeviceController::class, 'index']);
Route::get('/devices/stats', [DeviceController::class, 'stats']);
Route::get('/devices/models', [DeviceController::class, 'models']);
Route::get('/devices/{id}', [DeviceController::class, 'show']);
Route::get('/devices/imei/{imei}', [DeviceController::class, 'showByImei']);

Route::get('/device-positions', [DevicePositionController::class, 'all']);
Route::get('/device-positions/latest', [DevicePositionController::class, 'latest']);
Route::get('/devices/{device}/positions', [DevicePositionController::class, 'forDevice']);