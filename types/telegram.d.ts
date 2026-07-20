type TelegramThemeParams = {bg_color?: string; text_color?: string; hint_color?: string; button_color?: string; button_text_color?: string; secondary_bg_color?: string};
type TelegramUser = {id: number; first_name?: string; last_name?: string; username?: string};
type TelegramWebApp = {initData?: string; initDataUnsafe?: {user?: TelegramUser}; colorScheme?: 'light'|'dark'; themeParams?: TelegramThemeParams; ready:()=>void; expand:()=>void; BackButton?: {show:()=>void; hide:()=>void; onClick:(cb:()=>void)=>void; offClick:(cb:()=>void)=>void}; HapticFeedback?: {notificationOccurred:(type:'error'|'success'|'warning')=>void; impactOccurred:(style:'light'|'medium'|'heavy'|'rigid'|'soft')=>void}};
interface Window { Telegram?: { WebApp: TelegramWebApp } }
