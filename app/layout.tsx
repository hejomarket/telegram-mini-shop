import type { Metadata, Viewport } from 'next';import './globals.css';import { CartProvider } from '../lib/cart';
export const metadata: Metadata={title:'SOIA Protein Shop',description:'Toko snack protein nabati untuk Telegram Mini App dan web.',icons:{icon:'/favicon.svg'}};
export const viewport: Viewport={width:'device-width',initialScale:1,maximumScale:1,viewportFit:'cover',themeColor:'#123b2a'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><script src="https://telegram.org/js/telegram-web-app.js" async></script><CartProvider>{children}</CartProvider></body></html>}
