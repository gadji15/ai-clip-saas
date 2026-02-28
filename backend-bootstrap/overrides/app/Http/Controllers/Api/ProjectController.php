<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\ProjectStatus;
use App\Jobs\SubmitVideoWorkerJob;
use App\Models\PipelineEvent;
use App\Models\Project;
use App\Support\Youtube;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'youtube_url' => [
                'required',
                'url',
                'max:2048',
                static function (string $attribute, mixed $value, \Closure $fail): void {
                    if (!is_string($value) || !Youtube::isValidUrl($value)) {
                        $fail('The YouTube URL must be a youtube.com or youtu.be link.');
                    }
                },
            ],
        ]);

        $project = Project::query()->create([
            'name' => $data['name'],
            'youtube_url' => $data['youtube_url'],
            'status' => ProjectStatus::queued,
        ]);

        PipelineEvent::log('project.created', payload: ['source' => 'api'], project: $project);
        SubmitVideoWorkerJob::dispatch((string) $project->id)->afterCommit();

        return response()->json([
            'id' => (string) $project->id,
            'status' => $project->status->value,
        ], 201);
    }
}
