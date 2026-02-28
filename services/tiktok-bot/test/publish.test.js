process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../src/app');
const { createQueues } = require('../src/queue');

test('POST /publish validates payload', async () => {
  const queues = createQueues();
  await queues.startWorker(async () => {});

  const app = createApp({ queues });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  try {
    const { port } = server.address();

    const res = await fetch(`http://127.0.0.1:${port}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(typeof body.error, 'string');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await queues.stopWorker();
  }
});

test('POST /publish accepts a valid payload and returns a job id', async () => {
  // Ensure tests use memory driver by default (no redis in node:test).
  delete process.env.PUBLISH_REDIS_URL;

  const queues = createQueues();
  await queues.startWorker(async () => {});

  const app = createApp({ queues });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  try {
    const { port } = server.address();

    const res = await fetch(`http://127.0.0.1:${port}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        clip_path: '/data/clip.mp4',
        caption: 'hello',
        account_id: 'acct_123',
      }),
    });

    assert.equal(res.status, 202);

    const body = await res.json();
    assert.equal(body.status, 'accepted');
    assert.equal(body.mode, (process.env.PUBLISH_MODE || 'stub').toLowerCase());
    assert.equal(typeof body.job_id, 'string');

    const jobRes = await fetch(`http://127.0.0.1:${port}/jobs/${body.job_id}`);
    assert.equal(jobRes.status, 200);

    const job = await jobRes.json();
    assert.equal(job.id, body.job_id);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await queues.stopWorker();
  }
});
