<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ClipStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clip extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id',
        'tiktok_account_id',
        'external_id',
        'start_seconds',
        'end_seconds',
        'score',
        'reason',
        'status',
        'video_path',
        'subtitles_ass_path',
        'subtitles_srt_path',
    ];

    protected $casts = [
        'status' => ClipStatus::class,
        'start_seconds' => 'float',
        'end_seconds' => 'float',
        'score' => 'float',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tiktokAccount(): BelongsTo
    {
        return $this->belongsTo(TikTokAccount::class);
    }

    public function pipelineEvents(): HasMany
    {
        return $this->hasMany(PipelineEvent::class);
    }
}
