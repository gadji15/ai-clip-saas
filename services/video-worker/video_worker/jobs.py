from __future__ import annotations

from pathlib import Path

import structlog

from .callback import ClipArtifact, JobArtifacts, JobCallbackPayload, JobStatus, post_callback
from .config import get_settings
from .logging import get_logger
from .pipeline.audio import extract_audio_wav
from .pipeline.clip import render_clips
from .pipeline.context import JobContext
from .pipeline.download import download_youtube_video
from .pipeline.segment import segment_candidates, write_clips_json
from .pipeline.subtitles import write_srt
from .pipeline.transcribe import transcribe_audio, write_transcript_json
from .utils.errors import format_exception_short


def _best_effort_callback(
    *,
    ctx: JobContext,
    payload: JobCallbackPayload,
    timeout_seconds: float,
    max_retries: int,
    retry_backoff_seconds: float,
    logger: structlog.BoundLogger,
) -> None:
    try:
        post_callback(
            callback_url=ctx.callback_url,
            callback_secret=ctx.callback_secret,
            payload=payload,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            retry_backoff_seconds=retry_backoff_seconds,
            logger=logger,
        )
    except Exception:
        logger.exception("callback.post_failed", status=payload.status)


def _best_effort_progress_callback(
    *,
    ctx: JobContext,
    stage: str,
    progress_percent: int,
    message: str,
    timeout_seconds: float,
    max_retries: int,
    retry_backoff_seconds: float,
    logger: structlog.BoundLogger,
) -> None:
    logger.info("job.stage", stage=stage, progress_percent=progress_percent, message=message)

    _best_effort_callback(
        ctx=ctx,
        payload=JobCallbackPayload(
            job_id=ctx.job_id,
            project_id=ctx.project_id,
            status=JobStatus.processing,
            stage=stage,
            progress_percent=progress_percent,
            message=message,
        ),
        timeout_seconds=timeout_seconds,
        max_retries=max_retries,
        retry_backoff_seconds=retry_backoff_seconds,
        logger=logger,
    )


def process_job(
    job_id: str,
    project_id: str,
    youtube_url: str,
    callback_url: str,
    callback_secret: str,
) -> dict:
    settings = get_settings()
    logger = get_logger(service="video-worker", job_id=job_id, project_id=project_id)

    ctx = JobContext(
        job_id=job_id,
        project_id=project_id,
        youtube_url=youtube_url,
        callback_url=callback_url,
        callback_secret=callback_secret,
        root_dir=Path(settings.storage_path) / job_id,
    )

    ctx.ensure_dirs()

    current_stage = "start"
    current_progress = 0

    _best_effort_progress_callback(
        ctx=ctx,
        stage=current_stage,
        progress_percent=current_progress,
        message="Starting job",
        timeout_seconds=settings.callback_timeout_seconds,
        max_retries=settings.callback_max_retries,
        retry_backoff_seconds=settings.callback_retry_backoff_seconds,
        logger=logger,
    )

    try:
        current_stage = "download"
        current_progress = 10
        _best_effort_progress_callback(
            ctx=ctx,
            stage=current_stage,
            progress_percent=current_progress,
            message="Downloading source video",
            timeout_seconds=settings.callback_timeout_seconds,
            max_retries=settings.callback_max_retries,
            retry_backoff_seconds=settings.callback_retry_backoff_seconds,
            logger=logger,
        )
        download_youtube_video(
            youtube_url=ctx.youtube_url,
            output_path=ctx.source_video_path,
            logger=logger,
            max_retries=settings.download_max_retries,
            retry_backoff_seconds=settings.download_retry_backoff_seconds,
        )

        current_stage = "extract_audio"
        current_progress = 20
        _best_effort_progress_callback(
            ctx=ctx,
            stage=current_stage,
            progress_percent=current_progress,
            message="Extracting audio",
            timeout_seconds=settings.callback_timeout_seconds,
            max_retries=settings.callback_max_retries,
            retry_backoff_seconds=settings.callback_retry_backoff_seconds,
            logger=logger,
        )
        extract_audio_wav(
            input_video=ctx.source_video_path,
            output_wav=ctx.audio_path,
            logger=logger,
        )

        current_stage = "transcribe"
        current_progress = 50
        _best_effort_progress_callback(
            ctx=ctx,
            stage=current_stage,
            progress_percent=current_progress,
            message="Transcribing audio",
            timeout_seconds=settings.callback_timeout_seconds,
            max_retries=settings.callback_max_retries,
            retry_backoff_seconds=settings.callback_retry_backoff_seconds,
            logger=logger,
        )
        segments = transcribe_audio(
            audio_path=ctx.audio_path,
            model_name=settings.whisper_model,
            logger=logger,
            device=settings.whisper_device,
            temperature=settings.whisper_temperature,
            beam_size=settings.whisper_beam_size,
            best_of=settings.whisper_best_of,
        )

        write_transcript_json(segments=segments, output_path=ctx.transcript_json_path)
        write_srt(segments=segments, output_path=ctx.subtitles_srt_path)

        current_stage = "segment"
        current_progress = 70
        _best_effort_progress_callback(
            ctx=ctx,
            stage=current_stage,
            progress_percent=current_progress,
            message="Selecting clip candidates",
            timeout_seconds=settings.callback_timeout_seconds,
            max_retries=settings.callback_max_retries,
            retry_backoff_seconds=settings.callback_retry_backoff_seconds,
            logger=logger,
        )
        clips = segment_candidates(
            segments=segments,
            min_seconds=settings.clip_min_seconds,
            max_seconds=settings.clip_max_seconds,
            max_clips=settings.max_clips,
            audio_path=ctx.audio_path,
            video_path=ctx.source_video_path,
        )
        write_clips_json(clips=clips, output_path=ctx.clips_json_path)

        current_stage = "render_clips"
        current_progress = 90
        _best_effort_progress_callback(
            ctx=ctx,
            stage=current_stage,
            progress_percent=current_progress,
            message="Rendering clips",
            timeout_seconds=settings.callback_timeout_seconds,
            max_retries=settings.callback_max_retries,
            retry_backoff_seconds=settings.callback_retry_backoff_seconds,
            logger=logger,
        )
        rendered = render_clips(
            source_video=ctx.source_video_path,
            transcript_segments=segments,
            clips=clips,
            output_dir=ctx.clips_dir,
            logger=logger,
            subtitle_template=settings.subtitle_template,
            target_fps=settings.target_fps,
            enable_loudnorm=settings.enable_loudnorm,
        )

        artifacts = JobArtifacts(
            source_video_path=str(ctx.source_video_path),
            audio_path=str(ctx.audio_path),
            transcript_json_path=str(ctx.transcript_json_path),
            subtitles_srt_path=str(ctx.subtitles_srt_path),
            clips_json_path=str(ctx.clips_json_path),
            clips=[ClipArtifact(**c) for c in rendered],
        )

        completed_payload = JobCallbackPayload(
            job_id=job_id,
            project_id=project_id,
            status=JobStatus.completed,
            stage="completed",
            progress_percent=100,
            message="Job completed",
            artifacts=artifacts,
        )

        post_callback(
            callback_url=ctx.callback_url,
            callback_secret=ctx.callback_secret,
            payload=completed_payload,
            timeout_seconds=settings.callback_timeout_seconds,
            max_retries=settings.callback_max_retries,
            retry_backoff_seconds=settings.callback_retry_backoff_seconds,
            logger=logger,
        )

        logger.info("job.completed", clip_count=len(rendered))
        return completed_payload.model_dump(mode="json")
    except Exception as e:
        failed_payload = JobCallbackPayload(
            job_id=job_id,
            project_id=project_id,
            status=JobStatus.failed,
            stage=current_stage,
            progress_percent=current_progress,
            message=f"Failed during stage: {current_stage}",
            error=format_exception_short(e),
            artifacts=JobArtifacts(
                source_video_path=str(ctx.source_video_path),
                audio_path=str(ctx.audio_path),
                transcript_json_path=str(ctx.transcript_json_path),
                subtitles_srt_path=str(ctx.subtitles_srt_path),
                clips_json_path=str(ctx.clips_json_path),
            ),
        )

        _best_effort_callback(
            ctx=ctx,
            payload=failed_payload,
            timeout_seconds=settings.callback_timeout_seconds,
            max_retries=settings.callback_max_retries,
            retry_backoff_seconds=settings.callback_retry_backoff_seconds,
            logger=logger,
        )
        raise
