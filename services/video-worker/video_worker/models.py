from __future__ import annotations

from pydantic import BaseModel, HttpUrl


class JobCreateRequest(BaseModel):
    project_id: str
    youtube_url: HttpUrl
    callback_url: HttpUrl
    callback_secret: str


class JobCreateResponse(BaseModel):
    job_id: str
