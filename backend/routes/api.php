<?php 
use App\Http\Controllers\AuthApiController;

Route::post('/register', [AuthApiController::class, 'register']);
Route::post('/login', [AuthApiController::class, 'login']);
Route::post('logout', [AuthApiController::class, 'logout'])->middleware('auth:sanctum');
Route::get('user', [AuthApiContrioller::class, 'user'])->middleware('auth:sanctum');