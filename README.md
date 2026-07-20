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

## Task 5 - Secure Order Backend

### Supabase setup

1. Create a Supabase project and copy the project URL plus Service Role key.
2. Run `supabase/schema.sql` in the Supabase SQL editor or migration pipeline.
3. Store secrets only in server-side environment variables. The frontend never imports the Supabase client or Service Role key.

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit real secrets. `SUPABASE_SERVICE_ROLE_KEY` is used only by `lib/supabase/server.ts` from API routes.

### Demo Mode

When either Supabase environment variable is missing, the API automatically runs in Demo Mode. Orders are accepted, assigned a server-generated `SOIA-YYYYMMDD-XXXXXX` order number, and stored in process memory so local development and browser checkout continue without crashing.

### API endpoints

- `GET /api/health` returns JSON health information and the active mode.
- `POST /api/orders` validates customer, address, products, quantities, notes, and Telegram metadata with Zod. Clients send only `productId` and `quantity`; the server calculates subtotals and grand total from the server-side catalog.
- `GET /api/orders/:orderNumber` returns an order by server-generated order number.

### Order API examples

Create an order:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"customer":{"fullName":"Demo Customer","whatsapp":"+628123456789","email":"demo@example.com"},"address":{"address":"Jl. Demo No. 1","district":"Cilandak","city":"Jakarta Selatan","province":"DKI Jakarta","postalCode":"12430","notes":"Leave at reception"},"items":[{"productId":"soia-original","quantity":2}],"telegram":{"userId":123,"username":"demo","firstName":"Demo","lastName":"User","language":"id"}}'
```

Successful responses use:

```json
{ "success": true, "orderNumber": "SOIA-YYYYMMDD-XXXXXX", "mode": "supabase" }
```

Validation failures use:

```json
{ "success": false, "message": "Validation failed" }
```

## Admin Setup

1. Generate an admin password hash locally:

   ```bash
   npm run admin:hash-password -- "your-long-admin-password"
   ```

   The command prints only the generated `scrypt` hash. Never store or commit the plaintext password.

2. Add these server-only values to your local environment:

   ```bash
   ADMIN_EMAIL=
   ADMIN_PASSWORD_HASH=
   ADMIN_SESSION_SECRET=
   ```

   Use a long random `ADMIN_SESSION_SECRET`, for example `openssl rand -base64 48`.

3. Add the same environment variables in Vercel as server-only project environment variables.
4. Redeploy after changing environment variables.
5. Open `/admin/login` and sign in.

If admin variables are incomplete, the public storefront remains available and the admin login page shows a safe configuration message.

## Database Migration

Run the additive admin dashboard migration against the existing Task 5 database:

```sql
supabase/migrations/002_admin_dashboard.sql
```

The migration adds `admin_notes`, updates the order status constraint, and creates useful indexes for admin search and filters.

## Security Notes

* Admin secrets must remain server-only.
* Never use or commit a plaintext admin password.
* Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components or browser bundles.
* Internal admin notes are only available through authenticated admin pages and APIs.
* Public storefront and checkout remain available when admin configuration is incomplete.

## Midtrans Sandbox Setup

1. Create or access a Midtrans Sandbox account.
2. Obtain the Sandbox Client Key and Server Key from Midtrans Dashboard.
3. Add the values to `.env.local` using `MIDTRANS_IS_PRODUCTION=false`, `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_MERCHANT_ID`, and `NEXT_PUBLIC_APP_URL`.
4. Add the same variables to Vercel Preview.
5. Redeploy so server and browser config are refreshed.
6. Configure the payment notification URL in Midtrans Dashboard.
7. Test payment outcomes with the official Midtrans Sandbox simulator.

## Webhook URL

Use this public HTTPS notification URL:

```text
https://YOUR_DOMAIN/api/webhooks/midtrans
```

Replace `YOUR_DOMAIN` with the exact Vercel Production or Preview HTTPS URL that Midtrans can reach publicly.

## Payment Channels

Payment methods are controlled through Midtrans Snap Preferences, merchant activation, account type, Sandbox/Production environment, and Midtrans approval requirements. The application intentionally does not send `enabled_payments`, so Snap and the merchant dashboard decide which activated channels are displayed. Sandbox availability does not guarantee Production activation.

## Production Setup

1. Complete Midtrans production onboarding.
2. Obtain Production Client Key and Server Key.
3. Configure the Production notification URL.
4. Configure and activate Snap payment channels in Midtrans Dashboard.
5. Add Production environment variables in Vercel.
6. Set `MIDTRANS_IS_PRODUCTION=true`.
7. Redeploy.
8. Perform a controlled low-value production test before announcing availability.

## Payment Security

Never expose the Midtrans Server Key, Supabase service role key, admin password hash, or admin session secret. Browser Snap callbacks are only UX signals and are never proof of payment. Final payment status is controlled by verified Midtrans webhook signatures and server-side Get Status verification. Never commit real credentials.

## Payment Testing

Use Midtrans Sandbox tools to test pending, settlement, deny, cancel, expire, repeated webhook delivery, invalid signature handling, payment retry, and out-of-order notifications. Automated tests should mock Midtrans and never call Production APIs.
