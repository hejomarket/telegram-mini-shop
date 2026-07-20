'use client';
import { useEffect, useMemo, useState } from 'react';
export function useTelegram(){const [webApp,setWebApp]=useState<TelegramWebApp|null>(null);useEffect(()=>{const app=window.Telegram?.WebApp;if(!app)return;app.ready();app.expand();setWebApp(app);const theme=app.themeParams;if(theme?.bg_color)document.documentElement.style.setProperty('--tg-bg',theme.bg_color);if(theme?.text_color)document.documentElement.style.setProperty('--tg-text',theme.text_color);},[]);const user=webApp?.initDataUnsafe?.user;const displayName=useMemo(()=>user?.first_name || 'Teman SOIA',[user]);return {webApp,user,displayName,isTelegram:Boolean(webApp)}}
export function triggerAddHaptic(){window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('success')}
