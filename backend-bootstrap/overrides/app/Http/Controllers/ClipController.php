<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Clip;
use Illuminate\View\View;

class ClipController extends Controller
{
    public function show(Clip $clip): View
    {
        $this->authorize('view', $clip);

        $clip->load(['project', 'pipelineEvents' => fn ($q) => $q->orderByDesc('created_at')]);

        return view('clips.show', [
            'clip' => $clip,
            'events' => $clip->pipelineEvents,
        ]);
    }
}
