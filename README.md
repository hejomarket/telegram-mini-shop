# SOIA Protein Shop

SOIA Protein Shop adalah Telegram Mini App dan website toko online mobile-first untuk menjual tiga snack protein nabati: Original, Seaweed, dan Kecombrang.

## Fungsi layanan

- **GitHub**: menyimpan source code dan riwayat perubahan.
- **Vercel**: build dan hosting aplikasi Next.js tanpa domain pribadi.
- **Telegram Bot**: pintu masuk pengguna menuju Mini App. Jangan simpan token bot di GitHub.
- **Telegram Mini App**: membuka website Vercel di dalam Telegram dengan tema, sapaan pengguna, BackButton, dan haptic feedback.
- **Supabase**: database opsional untuk menyimpan `orders` dan `order_items`.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Aplikasi tetap berjalan walau Supabase belum diisi.

## Deploy ke Vercel

1. Push repository ke GitHub.
2. Buka Vercel, pilih **Add New Project**.
3. Import repository ini.
4. Framework akan terdeteksi sebagai Next.js.
5. Klik **Deploy**.
6. Setelah selesai, salin URL seperti `https://nama-project.vercel.app`.

## Environment variables Vercel

Di Vercel buka **Project Settings > Environment Variables**, lalu isi jika sudah memakai Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server API. Jangan pernah menaruh nilainya di kode client.

## Menjalankan SQL Supabase

1. Buka Supabase project.
2. Buka **SQL Editor**.
3. Salin isi `supabase/schema.sql`.
4. Jalankan SQL tersebut.

SQL mengaktifkan Row Level Security dan tidak membuka policy baca publik, sehingga pengunjung tidak bisa membaca semua pesanan.

## Memasang URL Vercel ke BotFather

1. Buka Telegram dan chat dengan **@BotFather**.
2. Jalankan `/setmenubutton`.
3. Pilih bot Anda.
4. Isi teks tombol, misalnya `Buka SOIA Shop`.
5. Masukkan URL Vercel, misalnya `https://nama-project.vercel.app`.

## Cara mengetes di Telegram

1. Buka bot Telegram Anda.
2. Tekan menu button yang sudah dipasang.
3. Pastikan Mini App terbuka, nama Telegram tampil jika tersedia, dan keranjang/checkout berjalan.
4. Buat pesanan percobaan.

## Mode Demo

Jika environment Supabase belum dipasang, API akan mengembalikan sukses dalam **Mode Demo — belum masuk database**. Browser menyimpan salinan pesanan terakhir di `localStorage` dengan key `soia-last-demo-order`.

## Catatan keamanan penting

- Jangan memasukkan token Telegram Bot ke GitHub atau file `.env.example`.
- Data `initDataUnsafe` Telegram hanya dipakai untuk tampilan. Validasi server-side Telegram `initData` belum lengkap dan wajib ditambahkan sebelum transaksi produksi.
- API menghitung harga dari katalog server, bukan dari total yang dikirim browser.
- Aplikasi tidak meminta informasi kartu pembayaran.

## File penting untuk pemula

- `app/page.tsx`: halaman utama.
- `components/AppShell.tsx`: katalog, keranjang, checkout, dan sukses order.
- `lib/products.ts`: sumber data produk dan harga.
- `lib/cart.tsx`: state keranjang dan localStorage.
- `lib/telegram.ts`: integrasi defensif Telegram Mini App.
- `app/api/orders/route.ts`: API checkout dan penyimpanan pesanan.
- `lib/supabase-server.ts`: client Supabase server-only.
- `supabase/schema.sql`: struktur database.
- `.env.example`: contoh environment variables.
