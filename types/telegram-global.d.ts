import type { TelegramEnvironment } from '../lib/telegram/types';

declare global {
  interface Window {
    Telegram?: TelegramEnvironment;
  }
}

export {};
