<?php

use App\Http\Controllers\DevicePositionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/tracker', [DevicePositionController::class, 'tracker']);

// SPA catch-all route - must be last
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
