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

## Architecture Review

Task 7.5 keeps one canonical flow for production orders and payments. Checkout clients submit customer/address details plus product IDs and quantities only; `app/api/orders/route.ts` validates the payload, `lib/orders/helpers.ts` recalculates prices from `lib/products.ts`, and `lib/orders/repository.ts` stores the order with a server-generated order number and access token. Public order reads remain backward compatible with older records, but records that have an `order_access_token_hash` require the matching access token before returning customer order details.

Payments are initiated only through `app/api/payments/midtrans/create/route.ts`. The server checks order ownership, payment eligibility, server-calculated totals, Midtrans configuration, and then creates a Midtrans Snap transaction. Browser Snap callbacks are UX-only; final payment state is controlled by `app/api/webhooks/midtrans/route.ts`, signature verification, amount matching, and server-side status verification helpers in `lib/midtrans`.

Server/client boundaries are intentional: Supabase service-role access, admin session signing, Midtrans Server Key usage, webhook verification, and payment attempt writes stay in server-only modules. Client components may use only public configuration such as the Midtrans Client Key and Snap.js URL. Telegram integration is browser-guarded and Browser Mode remains supported when `window.Telegram` is absent.

Environment variables are grouped as follows:

- Core storefront: no secrets required for build or local Browser Mode.
- Database mode: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Admin login: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`.
- Midtrans payments: `MIDTRANS_IS_PRODUCTION=false`, `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_MERCHANT_ID`, `NEXT_PUBLIC_APP_URL`.
- Optional local development: leave admin, Supabase, or Midtrans values blank to use safe unavailable/demo behavior.

When Midtrans is unconfigured, payment creation returns a safe unavailable response and the application still builds. When admin authentication is unconfigured, the public storefront remains available and admin login reports incomplete configuration instead of crashing.

Key validation commands:

```bash
npm install
npm run build
npm run lint
npm run typecheck
npm test
```

Local development startup remains:

```bash
npm install
npm run dev
```

Vercel deployment should configure only real server secrets in Vercel environment variables. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `ADMIN_PASSWORD_HASH`, or `ADMIN_SESSION_SECRET` through `NEXT_PUBLIC_` variables.

## Migration Order

Run migrations in this exact order for a migration-based setup:

1. `supabase/migrations/001_initial_orders_schema.sql`
2. `supabase/migrations/002_admin_dashboard.sql`
3. `supabase/migrations/003_midtrans_payments.sql`

For a new manual Supabase SQL Editor setup, `supabase/schema.sql` reflects the full current schema and the migrations document the additive history.

## Known External Setup Still Required

- A Midtrans account is not required for build completion.
- Midtrans credentials can be added later.
- Payment remains disabled until Midtrans credentials are configured.
- Supabase credentials are required for persistent database mode; otherwise local/demo mode uses process memory.
- Admin credentials are required for admin login.
- This repository review does not prove live Supabase or Midtrans Sandbox behavior unless valid external credentials are supplied separately.

## Customer Order Tracking

Task 8 adds customer-facing tracking at `/orders` and `/orders/[orderNumber]`. `/orders` reads only a small device-local history from `localStorage` key `soia.customerOrders`; it is a convenience list and not an authorization source. `/orders/[orderNumber]` loads authoritative detail from the customer-safe order API after the browser supplies the stored order access token in the `x-order-access-token` request header. Checkout stores only the order number, raw customer access token returned once by the server, created date, display name, latest statuses, and grand total. Malformed local records are ignored, duplicates are collapsed, and history is capped to 20 newest orders.

Order number alone is not sufficient to access sensitive order data. Legacy orders without an access-token hash are not exposed through customer APIs. The tracking page works in normal browser mode and Telegram Mini App browser contexts because all Telegram APIs remain guarded and the page does not depend on Telegram identity for authorization. Payment status is reloaded from the database during ordinary page fetches; the explicit **Periksa Status** action calls the verified Midtrans status flow only when Midtrans is configured and an existing payment attempt is present.

Timeline milestones are derived from trusted order/payment fields plus customer-safe order events when available. Legacy orders without event history receive a safe fallback timeline that avoids inventing transition timestamps.

## Shipping Information

Shipping in Task 8 is manually entered by an authenticated admin. Automatic courier integration, live shipment tracking, and courier URL linking are not implemented. Admins can provide courier name, shipping service, tracking number, and optional estimated delivery dates. Customers see tracking information once available, including a **Nomor Resi** copy action; before shipment, the UI states that the order has not been shipped.

## Order Events

Task 8 introduces `order_events` for lightweight server-side order history. Events are created for order creation, payment attempts, verified payment status changes, admin status changes, and meaningful shipping/tracking updates. Customer APIs filter events to customer-safe event types and never return internal metadata such as admin notes, webhook validation failures, raw provider payloads, or secrets. Event helpers perform short-window duplicate prevention for idempotent workflows.

## Security

Customer APIs return limited fields only: customer-safe order identifiers, statuses, totals, item snapshots, masked contact information, delivery details, shipping information, timeline data, and allowed actions. They do not return database IDs, access-token hashes, raw access tokens, admin notes, Telegram IDs, Telegram metadata, Midtrans server keys, raw Midtrans responses, or Snap tokens. Telegram identity is never used as sole authorization.

## Migration Order

Apply migrations in numeric order. Task 8 adds `supabase/migrations/005_customer_order_tracking.sql` after the existing initial, admin, and Midtrans migrations. The migration is additive: it adds nullable manual shipping columns and creates the `order_events` table plus indexes without rewriting historical migrations.

## Task 9 Product CMS

Authenticated admins manage products at `/admin/products`, create products at `/admin/products/new`, and edit immutable product IDs at `/admin/products/[productId]`. Product lifecycle is intentionally non-destructive: **Aktif** publishes a product to the storefront, **Tidak Aktif** hides it, **Tersedia** permits checkout, and **Tidak Tersedia** keeps an active product visible while blocking new purchases. Permanent product deletion is not exposed because historical orders and payment records keep product snapshots.

### Product Catalog Architecture

Supabase `public.products` is the canonical production catalog. The storefront reads active products through the shared product repository, and checkout reloads trusted products by ID from the same repository before calculating item snapshots and totals. Client cart data is only a responsive UX snapshot and never controls price, identity, or purchase eligibility. Historical `order_items` remain authoritative snapshots containing product ID, product name, unit price, quantity, and subtotal at purchase time. Midtrans Snap creation continues to use stored order items and stored order totals, not current catalog prices.

The legacy static catalog in `lib/products.ts` remains only as a development seed reference and explicit Demo Mode storefront fallback. It must not be used to override Supabase products when Supabase service-role configuration is available.

### Product Images

Product images use Supabase Storage bucket `product-images`. Public reads may be enabled for storefront display, but writes are server-controlled through the authenticated admin endpoint `POST /api/admin/products/images`. Accepted file types are JPEG, PNG, and WebP with a maximum size of 5 MB. Upload paths are sanitized under `products/uploads/` and never include admin or customer data. Replace an image by uploading the new image first, then saving the returned URL/path on the product record; cleanup of old managed images should be handled carefully and must not remove legacy external images.

### Demo Mode

When Supabase URL or service-role configuration is missing, the public storefront uses the documented static fallback catalog. Admin product create, edit, status, and image upload operations are disabled and return a safe message: `Pengelolaan produk membutuhkan konfigurasi database Supabase.` No fake product persistence is reported.

### Product Migration and Seed

Apply migrations in numeric order. Task 9 adds `supabase/migrations/006_product_cms.sql` after Task 8. The migration creates `public.products` additively with unique slug and SKU indexes, active/availability/display-order indexes, updated-at trigger support, safe constraints, and idempotent inserts that preserve existing public product IDs. `supabase/seed/products.sql` mirrors the safe seed strategy for local setup and uses conflict handling so production edits are not overwritten by repeated deployments.

### Storefront Banner Foundation

Task 9.5A adds `supabase/migrations/007_storefront_banners.sql` after the Product CMS migration. The migration creates `public.storefront_banners` as the database foundation for future storefront merchandising banners, including banner copy, managed image URL/path fields, CTA destination metadata, active status, display order, visual theme settings, schedule timestamps, and audit timestamps.

Schedule visibility is centralized in server-side domain logic: a banner is visible only when it is active, `starts_at` is empty or the server time is on/after it, and `ends_at` is empty or the server time is on/before it. Allowed destination types are `none`, `product`, `category`, `featured`, `all_products`, and `internal_path`; arbitrary external URLs are intentionally unsupported. Text themes are limited to `light` and `dark`.

Canonical banner types, validation, destination safety rules, schedule helpers, public serialization, and repository functions live under `lib/merchandising/`. In Demo Mode, where Supabase server configuration is missing, public banner listing safely returns an empty result rather than fake persistent banner data. The admin banner UI and public carousel are not implemented in this foundation task.

Run migrations in numeric order. Task 9.5A adds:

7. `supabase/migrations/007_storefront_banners.sql`
