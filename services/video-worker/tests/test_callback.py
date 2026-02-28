from __future__ import annotations

import httpx

from video_worker.callback import JobCallbackPayload, JobStatus, post_callback


def test_post_callback_sends_header_and_json(monkeypatch) -> None:
    seen: dict = {}

    def fake_post(url: str, *, json: dict, headers: dict, timeout: float) -> httpx.Response:
        seen["url"] = url
        seen["json"] = json
        seen["headers"] = headers
        seen["timeout"] = timeout
        return httpx.Response(200)

    monkeypatch.setattr("video_worker.callback.httpx.post", fake_post)

    payload = JobCallbackPayload(
        job_id="job_1",
        project_id="proj_1",
        status=JobStatus.processing,
        stage="download",
        progress_percent=10,
        message="Downloading",
    )

    post_callback(
        callback_url="https://example.test/callback",
        callback_secret="secret",
        payload=payload,
        timeout_seconds=12.5,
    )

    assert seen["headers"]["X-Callback-Secret"] == "secret"
    assert seen["json"]["job_id"] == "job_1"
    assert seen["json"]["status"] == "processing"
    assert seen["json"]["stage"] == "download"
    assert seen["json"]["progress_percent"] == 10
    assert seen["json"]["message"] == "Downloading"
    assert seen["timeout"] == 12.5


def test_job_callback_payload_model_dump_includes_progress_fields() -> None:
    payload = JobCallbackPayload(
        job_id="job_1",
        project_id="proj_1",
        status=JobStatus.processing,
        stage="transcribe",
        progress_percent=50,
        message="Transcribing audio",
    )

    data = payload.model_dump(mode="json")

    assert data["stage"] == "transcribe"
    assert data["progress_percent"] == 50
    assert data["message"] == "Transcribing audio"
