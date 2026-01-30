<?php

use App\Http\Controllers\DevicePositionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/tracker', [DevicePositionController::class, 'tracker']);
