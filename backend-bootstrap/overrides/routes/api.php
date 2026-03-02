<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\WorkerCallbackController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('internal.secret')->post('/projects', [ProjectController::class, 'store']);
Route::middleware('internal.secret')->get('/projects/{project}', [ProjectController::class, 'show']);

Route::middleware('worker.callback')->post('/worker/callback', [WorkerCallbackController::class, 'store']);
