<?php

use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\DevicePositionController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthApiController::class, 'register']);
Route::post('/login', [AuthApiController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
	Route::post('/logout', [AuthApiController::class, 'logout']);
	Route::get('/user', [AuthApiController::class, 'user']);
});

Route::get('/device-positions', [DevicePositionController::class, 'all']);
Route::get('/device-positions/latest', [DevicePositionController::class, 'latest']);
Route::get('/devices/{device}/positions', [DevicePositionController::class, 'forDevice']);