export const metadata = {
  title: "SOIA Protein Shop",
  description: "Telegram Mini App Store"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
