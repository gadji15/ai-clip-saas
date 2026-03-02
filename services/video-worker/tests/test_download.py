from __future__ import annotations

from video_worker.pipeline.download import _yt_dlp_format_for_language


def test_yt_dlp_format_for_language_defaults_to_bestvideo_bestaudio() -> None:
    assert _yt_dlp_format_for_language(None) == "bestvideo+bestaudio/best"
    assert _yt_dlp_format_for_language("en") == "bestvideo+bestaudio/best"


def test_yt_dlp_format_for_language_prefers_french_dubbed_track() -> None:
    assert _yt_dlp_format_for_language("fr") == "best[language=fr]/bestvideo+bestaudio/best"
    assert _yt_dlp_format_for_language(" FR ") == "best[language=fr]/bestvideo+bestaudio/best"

