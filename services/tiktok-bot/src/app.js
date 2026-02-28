const express = require('express');

const { createHealthRouter } = require('./routes/health');
const { createJobsRouter } = require('./routes/jobs');
const { createPublishRouter } = require('./routes/publish');

function createApp({ queues }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10mb' }));

  app.use('/health', createHealthRouter());
  app.use('/', createPublishRouter({ queues }));
  app.use('/', createJobsRouter({ queues }));

  return app;
}

module.exports = {
  createApp,
};
