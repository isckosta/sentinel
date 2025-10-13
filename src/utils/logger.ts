import pino from 'pino';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs';

const sentinelDir = join(homedir(), '.sentinel');

if (!existsSync(sentinelDir)) {
  mkdirSync(sentinelDir, { recursive: true });
}

let _logger: pino.Logger | null = null;

/**
 * Returns a singleton instance of the Pino logger.
 * The logger is configured to output to a file (telemetry.log) and optionally to the console (pino-pretty).
 * Log level is determined by the LOG_LEVEL environment variable or defaults to 'info'.
 * @returns The configured Pino logger instance.
 */
export function getLogger(): pino.Logger {
  if (_logger) {
    return _logger;
  }

  const targets: pino.TransportTargetOptions[] = [
    {
      level: process.env.LOG_LEVEL || 'info',
      target: 'pino/file',
      options: { destination: join(sentinelDir, 'telemetry.log') },
    },
  ];

  if (process.env.LOG_LEVEL !== 'silent') {
    targets.unshift({
      level: process.env.LOG_LEVEL || 'info',
      target: 'pino-pretty',
      options: { colorize: true },
    });
  }

  _logger = pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.transport({ targets })
  );

  return _logger;
}
