<?php

declare(strict_types=1);

use App\Http\Controllers\ClipAssetController;
use App\Http\Controllers\ClipController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'admin'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}/status', [ProjectController::class, 'status'])->name('projects.status');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    Route::get('/clips/{clip}', [ClipController::class, 'show'])->name('clips.show');

    // Secure serving of generated artifacts stored in the shared volume.
    Route::get('/clips/{clip}/video', [ClipAssetController::class, 'video'])->name('clips.video');
    Route::get('/clips/{clip}/subtitles.ass', [ClipAssetController::class, 'downloadAss'])->name('clips.subtitles.ass');
});

require __DIR__.'/auth.php';
