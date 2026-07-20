'use client';

import { useEffect } from 'react';
import { useTelegram } from '../providers/TelegramProvider';

export function useTelegramMainButton(quantity: number, onClick: () => void) {
  const { setMainButton } = useTelegram();

  useEffect(() => {
    setMainButton(quantity, onClick);
  }, [onClick, quantity, setMainButton]);
}
