<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'youtube_url',
        'status',
        'stage',
        'progress_percent',
        'last_log_message',
        'worker_job_id',
        'source_video_path',
        'audio_path',
        'transcript_json_path',
        'subtitles_srt_path',
        'clips_json_path',
        'error',
    ];

    protected $casts = [
        'status' => ProjectStatus::class,
        'progress_percent' => 'integer',
    ];

    public function clips(): HasMany
    {
        return $this->hasMany(Clip::class);
    }

    public function pipelineEvents(): HasMany
    {
        return $this->hasMany(PipelineEvent::class);
    }
}
