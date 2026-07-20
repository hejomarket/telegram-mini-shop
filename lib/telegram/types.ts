export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
};

export type TelegramMainButton = {
  text: string;
  isVisible: boolean;
  setText: (text: string) => TelegramMainButton;
  show: () => TelegramMainButton;
  hide: () => TelegramMainButton;
  onClick: (callback: () => void) => TelegramMainButton;
  offClick: (callback: () => void) => TelegramMainButton;
};

export type TelegramHapticFeedback = {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred?: (type: string) => void;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  isFullscreen?: boolean;
  MainButton: TelegramMainButton;
  HapticFeedback?: TelegramHapticFeedback;
  openLink?: (url: string) => void;
  ready: () => void;
  expand: () => void;
  requestFullscreen?: () => void;
  disableVerticalSwipes?: () => void;
  onEvent?: (eventType: string, eventHandler: () => void) => void;
  offEvent?: (eventType: string, eventHandler: () => void) => void;
};

export type TelegramEnvironment = {
  WebApp?: TelegramWebApp;
};
