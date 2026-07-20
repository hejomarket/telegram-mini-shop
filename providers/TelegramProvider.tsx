'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { TelegramThemeParams, TelegramUser, TelegramWebApp } from '../lib/telegram/types';
import { getTelegramWebApp, isTelegramWebAppAvailable, logTelegramDevelopmentMessage, supportsVersion } from '../lib/telegram/web-app';

type TelegramMode = 'telegram' | 'browser';

type TelegramDebugInfo = {
  platform: string;
  version: string;
  colorScheme: string;
  viewportHeight: string;
  viewportStableHeight: string;
  isExpanded: string;
  isFullscreen: string;
  language: string;
  theme: string;
  initDataExists: string;
  userExists: string;
};

type TelegramContextValue = {
  mode: TelegramMode;
  isTelegram: boolean;
  user: TelegramUser | null;
  theme: TelegramThemeParams;
  debugInfo: TelegramDebugInfo;
  triggerHaptic: () => void;
  setMainButton: (quantity: number, onClick: () => void) => void;
};

const TelegramContext = createContext<TelegramContextValue | null>(null);

const emptyDebugInfo: TelegramDebugInfo = {
  platform: '-',
  version: '-',
  colorScheme: '-',
  viewportHeight: '-',
  viewportStableHeight: '-',
  isExpanded: '-',
  isFullscreen: '-',
  language: '-',
  theme: '-',
  initDataExists: 'No',
  userExists: 'No',
};

function createDebugInfo(webApp: TelegramWebApp | null): TelegramDebugInfo {
  if (!webApp) return emptyDebugInfo;

  return {
    platform: webApp.platform || '-',
    version: webApp.version || '-',
    colorScheme: webApp.colorScheme || '-',
    viewportHeight: webApp.viewportHeight ? `${Math.round(webApp.viewportHeight)}px` : '-',
    viewportStableHeight: webApp.viewportStableHeight ? `${Math.round(webApp.viewportStableHeight)}px` : '-',
    isExpanded: webApp.isExpanded ? 'Yes' : 'No',
    isFullscreen: webApp.isFullscreen ? 'Yes' : 'No',
    language: webApp.initDataUnsafe?.user?.language_code || '-',
    theme: JSON.stringify(webApp.themeParams ?? {}, null, 2),
    initDataExists: webApp.initData ? 'Yes' : 'No',
    userExists: webApp.initDataUnsafe?.user ? 'Yes' : 'No',
  };
}

function applyTelegramTheme(theme: TelegramThemeParams) {
  const root = document.documentElement;
  root.style.setProperty('--tg-bg', theme.bg_color || '#f7f0df');
  root.style.setProperty('--tg-text', theme.text_color || '#173529');
  root.style.setProperty('--tg-card', theme.secondary_bg_color || theme.section_bg_color || '#ffffff');
  root.style.setProperty('--tg-button', theme.button_color || '#123b2a');
  root.style.setProperty('--tg-button-text', theme.button_text_color || '#ffffff');
  root.style.setProperty('--tg-accent', theme.accent_text_color || theme.link_color || '#d8ae57');
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [mode, setMode] = useState<TelegramMode>('browser');

  useEffect(() => {
    try {
      const currentWebApp = getTelegramWebApp();
      if (!isTelegramWebAppAvailable(currentWebApp)) {
        setMode('browser');
        return;
      }

      currentWebApp.ready();
      currentWebApp.expand();

      if (currentWebApp.requestFullscreen && supportsVersion(currentWebApp.version, '8.0')) {
        currentWebApp.requestFullscreen();
      }

      if (currentWebApp.disableVerticalSwipes && supportsVersion(currentWebApp.version, '7.7')) {
        currentWebApp.disableVerticalSwipes();
      }

      applyTelegramTheme(currentWebApp.themeParams ?? {});
      setWebApp(currentWebApp);
      setMode('telegram');
    } catch (error) {
      logTelegramDevelopmentMessage('Initialization failed; falling back to Browser Mode.', error);
      setWebApp(null);
      setMode('browser');
    }
  }, []);

  const triggerHaptic = useCallback(() => {
    if (mode !== 'telegram') return;
    try {
      webApp?.HapticFeedback?.impactOccurred('light');
    } catch (error) {
      logTelegramDevelopmentMessage('Haptic feedback failed.', error);
    }
  }, [mode, webApp]);

  const setMainButton = useCallback((quantity: number, onClick: () => void) => {
    if (mode !== 'telegram' || !webApp) return;

    const mainButton = webApp.MainButton;
    mainButton.offClick(onClick);

    if (quantity > 0) {
      mainButton.setText(`Checkout (${quantity})`).show().onClick(onClick);
    } else {
      mainButton.hide();
    }
  }, [mode, webApp]);

  const value = useMemo<TelegramContextValue>(() => ({
    mode,
    isTelegram: mode === 'telegram',
    user: webApp?.initDataUnsafe?.user ?? null,
    theme: webApp?.themeParams ?? {},
    debugInfo: createDebugInfo(webApp),
    triggerHaptic,
    setMainButton,
  }), [mode, setMainButton, triggerHaptic, webApp]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) throw new Error('useTelegram must be used within TelegramProvider');
  return context;
}
