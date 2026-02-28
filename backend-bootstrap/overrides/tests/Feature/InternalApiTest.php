<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternalApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_create_requires_internal_secret(): void
    {
        config()->set('admin.internal_api_secret', 'test-secret');

        $this->postJson('/api/projects', [
            'name' => 'Test',
            'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ])->assertForbidden();

        $this->withHeader('X-Internal-Secret', 'test-secret')
            ->postJson('/api/projects', [
                'name' => 'Test',
                'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ])
            ->assertCreated()
            ->assertJsonStructure(['id', 'status']);
    }

    public function test_worker_callback_requires_callback_secret(): void
    {
        config()->set('admin.video_worker_callback_secret', 'cb-secret');

        $payload = [
            'job_id' => 'job-1',
            'project_id' => '00000000-0000-0000-0000-000000000000',
            'status' => 'queued',
        ];

        $this->postJson('/api/worker/callback', $payload)->assertForbidden();
    }
}
