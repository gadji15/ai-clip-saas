from __future__ import annotations

from pathlib import Path

import structlog

from ..utils.ffprobe import probe_video
from ..utils.subprocess import run
from .face_tracking import estimate_face_center_x
from .subtitles import write_stylized_ass_for_clip
from .types import ClipCandidate, TranscriptSegment


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _compute_crop_x_pixels(
    *,
    source_video: Path,
    face_center_x_rel: float,
    target_w: int = 1080,
    target_h: int = 1920,
) -> int:
    info = probe_video(source_video)
    a_target = target_w / target_h
    a_src = info.width / info.height

    if a_src > a_target:
        # We'll scale the source to target height, then crop horizontally.
        scale = target_h / info.height
        scaled_w = info.width * scale
    else:
        # We'll scale the source to target width; no horizontal crop needed.
        scaled_w = float(target_w)

    crop_x = face_center_x_rel * scaled_w - target_w / 2.0
    crop_x = _clamp(crop_x, 0.0, max(0.0, scaled_w - target_w))
    return int(round(crop_x))


def render_clips(
    *,
    source_video: Path,
    transcript_segments: list[TranscriptSegment],
    clips: list[ClipCandidate],
    output_dir: Path,
    logger: structlog.BoundLogger,
    subtitle_template: str = "default",
    target_fps: int = 30,
    enable_loudnorm: bool = False,
) -> list[dict]:
    output_dir.mkdir(parents=True, exist_ok=True)

    rendered: list[dict] = []

    for clip in clips:
        clip_dir = output_dir / clip.clip_id
        clip_dir.mkdir(parents=True, exist_ok=True)

        out_video = clip_dir / "video.mp4"
        out_ass = clip_dir / "subtitles.ass"

        write_stylized_ass_for_clip(
            clip_start_seconds=clip.start_seconds,
            clip_end_seconds=clip.end_seconds,
            segments=transcript_segments,
            output_path=out_ass,
            template=subtitle_template,
        )

        if out_video.exists() and out_video.stat().st_size > 0:
            rendered.append(
                {
                    "clip_id": clip.clip_id,
                    "start_seconds": clip.start_seconds,
                    "end_seconds": clip.end_seconds,
                    "score": clip.score,
                    "reason": clip.reason,
                    "video_path": str(out_video),
                    "subtitles_ass_path": str(out_ass),
                }
            )
            continue

        duration = max(0.0, clip.end_seconds - clip.start_seconds)

        crop_x: int | None = None
        face_x = estimate_face_center_x(
            video_path=source_video,
            start_seconds=clip.start_seconds,
            end_seconds=clip.end_seconds,
            work_dir=clip_dir,
        )
        if face_x is not None:
            crop_x = _compute_crop_x_pixels(source_video=source_video, face_center_x_rel=face_x)

        if crop_x is None:
            crop_filter = "crop=1080:1920:x=(iw-1080)/2:y=(ih-1920)/2"
        else:
            crop_filter = f"crop=1080:1920:x={crop_x}:y=(ih-1920)/2"

        def _ffmpeg_filter_escape_path(p: Path) -> str:
            # ffmpeg filter args treat ':', ',', and '\\' specially.
            s = p.as_posix()
            return s.replace('\\', '\\\\').replace(':', '\\:').replace(',', '\\,')

        fps = max(1, int(target_fps))

        vf = ",".join(
            [
                "scale=1080:1920:force_original_aspect_ratio=increase",
                crop_filter,
                f"fps={fps}",
                f"ass={_ffmpeg_filter_escape_path(out_ass)}",
            ]
        )

        ffmpeg_args: list[str] = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            str(clip.start_seconds),
            "-i",
            str(source_video),
            "-t",
            str(duration),
            "-vf",
            vf,
        ]

        if enable_loudnorm:
            ffmpeg_args += [
                "-af",
                "loudnorm=I=-16:TP=-1.5:LRA=11",
            ]

        ffmpeg_args += [
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "veryfast",
            "-crf",
            "18",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-movflags",
            "+faststart",
            str(out_video),
        ]

        run(
            ffmpeg_args,
            logger=logger.bind(clip_id=clip.clip_id),
        )

        if not out_video.exists() or out_video.stat().st_size <= 0:
            raise RuntimeError(f"ffmpeg produced no output for {clip.clip_id}")

        rendered.append(
            {
                "clip_id": clip.clip_id,
                "start_seconds": clip.start_seconds,
                "end_seconds": clip.end_seconds,
                "score": clip.score,
                "reason": clip.reason,
                "video_path": str(out_video),
                "subtitles_ass_path": str(out_ass),
            }
        )

    return rendered
