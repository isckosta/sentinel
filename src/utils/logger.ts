import pino from 'pino';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs';

const sentinelDir = join(homedir(), '.sentinel');

// Ensure the directory exists
if (!existsSync(sentinelDir)) {
  mkdirSync(sentinelDir, { recursive: true });
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination({
    dest: join(sentinelDir, 'telemetry.log'),
    sync: true,
  })
);
