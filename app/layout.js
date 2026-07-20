import "./globals.css";

export const metadata = {
  title: "SOIA Protein Shop",
  description: "Telegram Mini App MVP for SOIA Protein Shop.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
