type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_META: Record<LogLevel, { label: string; write: (...args: unknown[]) => void }> = {
  debug: { label: 'DEBUG', write: console.debug ?? console.log },
  info: { label: 'INFO ', write: console.log },
  warn: { label: 'WARN ', write: console.warn },
  error: { label: 'ERROR', write: console.error },
};

function timestamp(): string {
  // HH:MM:SS.mmm — enough precision to see fetch steps in order without the noise of a full date.
  return new Date().toISOString().split('T')[1]?.replace('Z', '') ?? '';
}

export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

/**
 * Creates a tagged logger that prints one consistent, easy-to-scan line per call:
 *
 *   [12:04:31.842] [Location] INFO  Requesting permission…
 *   [12:04:32.010] [Location] INFO  Permission granted { canAskAgain: true }
 *   [12:04:32.011] [Location] ERROR Location services disabled
 *
 * so a scrolling Metro/device log stays readable instead of interleaved raw console.log calls.
 */
export function createLogger(tag: string): Logger {
  const log = (level: LogLevel, message: string, data?: unknown) => {
    const { label, write } = LEVEL_META[level];
    const prefix = `[${timestamp()}] [${tag}] ${label}`;
    if (data !== undefined) {
      write(`${prefix} ${message}`, data);
    } else {
      write(`${prefix} ${message}`);
    }
  };

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
  };
}
