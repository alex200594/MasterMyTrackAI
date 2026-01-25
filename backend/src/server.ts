import { app, ensureUploadDirs } from './app.js';
import { env } from './config/env.js';
import { startMasteringWorker } from './queues/masteringWorker.js';

async function start() {
  await ensureUploadDirs();
  startMasteringWorker();
  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
