type LogLevel = 'info' | 'warn' | 'error';

export function serverLog(level: LogLevel, event: string, fields: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV === 'production' && level === 'info') return;
  const entry = { level, event, ...fields, at: new Date().toISOString() };
  if (level === 'error') console.error(JSON.stringify(entry));
  else if (level === 'warn') console.warn(JSON.stringify(entry));
  else console.info(JSON.stringify(entry));
}
