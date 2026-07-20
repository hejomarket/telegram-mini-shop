import type { TelegramWebApp } from './types';

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

export function isTelegramWebAppAvailable(webApp: TelegramWebApp | null): webApp is TelegramWebApp {
  return Boolean(webApp?.initData || webApp?.initDataUnsafe || webApp?.platform);
}

export function supportsVersion(current: string, required: string) {
  const currentParts = current.split('.').map((part) => Number.parseInt(part, 10));
  const requiredParts = required.split('.').map((part) => Number.parseInt(part, 10));

  for (let index = 0; index < Math.max(currentParts.length, requiredParts.length); index += 1) {
    const currentValue = Number.isFinite(currentParts[index]) ? currentParts[index] : 0;
    const requiredValue = Number.isFinite(requiredParts[index]) ? requiredParts[index] : 0;
    if (currentValue > requiredValue) return true;
    if (currentValue < requiredValue) return false;
  }

  return true;
}

export function logTelegramDevelopmentMessage(message: string, detail?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[Telegram Mini App] ${message}`, detail ?? '');
  }
}
