# Database Cleanup Guide untuk TRISHIP Dropshipping Platform

## Panduan Membersihkan Data Sebelum Production

### Langkah 1: Hapus Semua Produk (Kecuali yang Ingin Dipertahankan)

1. Masuk ke Supabase Dashboard
2. Buka tabel `products`
3. Hapus semua row yang tidak perlu
4. Pastikan kolom penting terisi: `name`, `price`, `description`, `image`, `category`

**Alternatif via Admin Panel:**
- Login ke AdminPage (julyandapa@gmail.com)
- Masuk tab "Inventory"
- Hapus produk satu per satu atau bulk delete jika ada fitur

### Langkah 2: Hapus Semua Orders

1. Di Supabase, buka tabel `orders`
2. Hapus semua row test/dummy orders
3. Verifikasi tabel kosong

**Catatan:** Ini penting agar data penjualan product tidak tercampur dengan test data

### Langkah 3: Hubungi Admin Jika Need SQL Query

Jika ingin bulk delete via SQL (lebih cepat):

```sql
-- HATI-HATI! Backup dulu sebelum jalankan ini

-- Hapus semua products (karena ini test)
DELETE FROM products WHERE TRUE;

-- Hapus semua orders (karena ini test)  
DELETE FROM orders WHERE TRUE;

-- Jika punya tabel reviews/logs
DELETE FROM reviews WHERE TRUE;
DELETE FROM contact_messages WHERE TRUE;

-- Reset sequences/IDs
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
```

### Langkah 4: Verifikasi Admin Account

Pastikan admin account:
- Email: **julyandapa@gmail.com**
- Sudah terdaftar di Supabase auth
- Bisa login ke AdminPage

### Langkah 5: Clear Browser LocalStorage

Jalankan di Developer Tools (F12 > Console) sebelum test:

```javascript
// Clear semua test data dari localStorage
localStorage.clear();
sessionStorage.clear();

// Refresh halaman
location.reload();
```

### Langkah 6: Environment Variables Checklist

Pastikan `.env.local` sudah correct sebelum production:

```
✓ VITE_PAYPAL_CLIENT_ID = Live Client ID (bukan Sandbox)
✓ VITE_API_KEY = Valid Gemini API Key
✓ .env.local tidak di-commit ke Git (check .gitignore)
✓ Production akan gunakan env vars dari hosting platform
```

### Langkah 7: Build & Test Production

```bash
# Test production build locally
npm run build
npm run preview

# Upload build/ folder ke production server/Vercel
```

### Langkah 8: Monitoring Setelah Live

- Monitor Supabase dashboard untuk incoming orders
- Setup email notifications untuk setiap order
- Test real payment dengan nominal kecil dulu
- Monitor PayPal payments received

## Comprehensive Security Checklist Sebelum Production

**Penjelasan:** Setiap langkah dibuat step-by-step agar mudah dipahami pemula.

### 1. ✅ Hapus console.log() untuk Production

**Kenapa penting?** Console.log bisa memunculkan informasi sensitif di browser publik

**Cara mengecek:**
```bash
# Cari semua console.log di project
grep -r "console.log" src/ --include="*.tsx" --include="*.ts"

# Di Windows PowerShell:
Select-String -Path "src\*.tsx", "src\*.ts" -Pattern "console\.log" -Recurse
```

**Solusi:**
- Untuk production, gunakan `console.log hanya untuk errors:
- Ganti `console.log()` dengan `console.error()` untuk error handling
- Atau gunakan: `if (process.env.NODE_ENV !== 'production') { console.log(...) }`

✅ **Status:** Done (sudah implement di security.ts)

---

### 2. ✅ Setup HTTPS (Automatic di Vercel)

**Kenapa penting?** HTTPS melindungi data pelanggan dari interception

**Di Vercel:** ✅ **Automatic** 
- Vercel otomatis setup HTTPS untuk setiap deployment
- Certificate dari Let's Encrypt
- Tidak perlu setting manual

**Jika pakai hosting lain:**
- Use Let's Encrypt (free)
- DigiitalOcean/AWS akan setup otomatis

✅ **Status:** Ready (akan automatic saat deploy ke Vercel)

---

### 3. ✅ Enable CORS untuk Domain Sendiri Saja

**Kenapa penting?** Mencegah website lain steal data Anda

**Sekarang:** CORS allow semua (development mode)

**Untuk Production:**
Update `vite.config.ts`:
```typescript
server: {
  cors: {
    origin: 'https://yourdomain.com', // Ganti dengan domain Anda
    credentials: true
  }
}
```

Di Supabase:
1. Buka Supabase Dashboard
2. Settings > Auth > URL Configuration
3. Add Authorized URLs:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

✅ **Langkah:** Perlu dikonfigurasi saat punya domain sendiri

---

### 4. ✅ Validate Semua User Inputs

**Kenapa penting?** Mencegah XSS & SQL injection attacks

**Status di project:**
```
✅ Contact form: Sudah validate (security.ts)
✅ Admin login: Sudah validate
✅ Product form: Sudah validate
✅ Checkout form: Sudah validate
```

**Cara test (di Browser DevTools):**
```javascript
// Coba kirim input berbahaya ke contact form:
// <script>alert('XSS')</script>
// Jika tidak muncul alert, berarti sudah aman ✅
```

✅ **Status:** Done

---

### 5. ✅ Setup Rate Limiting

**Kenapa penting?** Mencegah brute force attacks (otomatis login berkali-kali)

**Sudah implement:**
- Function `checkRateLimit()` ada di `security.ts`
- Bisa digunakan untuk login attempts, contact form, payment

**Cara activate di AdminPage (Login):**

Di `pages/AdminPage.tsx`, sebelum login:
```typescript
import { checkRateLimit, logSecurityEvent } from '../services/security';

// Sebelum sign in:
if (!checkRateLimit(email, 5, 900000)) { // Max 5 attempts per 15 minutes
  setLoginError('Terlalu banyak percobaan login. Coba lagi dalam 15 menit.');
  logSecurityEvent('Brute force attempt', { email });
  return;
}
```

⚠️ **Status:** Implemented tapi belum digunakan. Mari kita activate.

---

### 6. ✅ Enable Supabase RLS (Row Level Security)

**Kenapa penting?** Database-level protection. User hanya bisa lihat data mereka sendiri.

**Setup di Supabase:**

1. Login Supabase Dashboard
2. Buka "SQL Editor"
3. Jalankan query ini:

```sql
-- Enable RLS pada tabel products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Semua bisa baca products
CREATE POLICY "Products are viewable by everyone" ON products
FOR SELECT USING (true);

-- Hanya admin yang bisa edit
CREATE POLICY "Products are editable by admin only" ON products
FOR UPDATE USING (auth.jwt() ->> 'email' = 'julyandapa@gmail.com');

-- Enable RLS pada orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- User hanya bisa lihat order mereka sendiri
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (items->>'customer'->> 'email' = auth.jwt() ->> 'email' OR auth.jwt() ->> 'email' = 'julyandapa@gmail.com');
```

⚠️ **Status:** Perlu dijalankan di Supabase

---

### 7. ✅ Test XSS Protection

**Kenapa penting?** Memastikan tidak ada injeksi script berbahaya

**Cara test (di Browser):**

Buka contact form, coba kirim:
```
Name: <img src=x onerror=alert('XSS')>
Subject: Test
Message: Ini hanya test XSS
```

**Hasil:**
- ✅ **Aman:** Alert tidak muncul (input di-sanitize)
- ❌ **Tidak aman:** Alert muncul (ada XSS vulnerability)

**Status di project:** ✅ Done (security.ts sanitizeInput sudah protect)

---

### 8. ✅ Monitor SQL Injection Attempts

**Kenapa penting?** Mencegah database hacking

**Cara monitor:**
1. Supabase Dashboard > Logs
2. Lihat query yang suspicious
3. SecurityEvent log kami sudah mencatat attempts

**Automatic protections:**
- ✅ Supabase ORM (`.select()`, `.insert()`) sudah protected
- ✅ Parameterized queries = safe dari SQL injection
- ⚠️ Jangan pernah pakai string concatenation untuk queries!

**JANGAN:**
```typescript
// ❌ TIDAK AMAN!
.select('*').where(`id = ${userId}`)
```

**HARUS:**
```typescript
// ✅ AMAN
.select('*').eq('id', userId)
```

✅ **Status:** Done (sudah pakai ORM yang safe)

---

### 9. ✅ Setup Error Monitoring (Optional tapi Recommended)

**Kenapa penting?** Know real-time jika ada error di production

**Opsi:**

**Option A: Sentry (Recommended for Beginners)**
```bash
npm install @sentry/react @sentry/tracing
```

Setup (di `index.tsx`):
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/123456",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

**Option B: Simpler - Gunakan LogRocket**
- Free tier cukup bagus
- Automatic error tracking
- Session replay

**Option C: Gunakan Supabase Logs**
- Check Supabase Dashboard > Logs
- Gratis, built-in

⚠️ **Status:** Optional, tapi recommended

---

### 10. ✅ Backup Database Sebelum Go Live

**Kenapa penting?** Jika ada masalah, bisa restore

**Cara backup Supabase:**

1. Supabase Dashboard > Backups (untuk project paid)
   - atau manual export:
   
2. Buka SQL Editor, export:
```sql
-- Export products
SELECT * FROM products;

-- Export orders  
SELECT * FROM orders;

-- Save hasil ke .csv atau .json
```

3. Atau gunakan `pg_dump` (untuk advanced):
```bash
pg_dump postgresql://user:password@db.supabase.co/postgres > backup.sql
```

✅ **Langkah:** Jalankan sebelum deployment

---

### 11. ✅ Verify Environment Variables

**Kenapa penting?** Wrong env vars = app broken atau less secure

**Checklist:**

File `.env.local` (JANGAN commit ke Git):
```
✓ VITE_PAYPAL_CLIENT_ID = Live ID (bukan Sandbox)
✓ VITE_API_KEY = Valid Gemini API key (active)
✓ Panjang minimal 20 karakter
✓ Tidak ada spasi atau quotes extra
```

**Cara verify:**
```bash
# Check file exists dan bukan empty
cat .env.local | grep VITE_

# Di production (Vercel), set variables di:
# Vercel Dashboard > Settings > Environment Variables
```

✅ **Status:** Check kembali

---

### 12. ✅ Setup Content Security Policy (CSP)

**Kenapa penting?** Additional XSS protection layer

**Setup (di `index.html`):**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.paypal.com https://apis.google.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               img-src 'self' https: data:;
               font-src 'self' https://fonts.gstatic.com">
```

⚠️ **Status:** Optional tapi recommended

---

## **QUICK SECURITY CHECKLIST (Copy-Paste):**

Sebelum deploy, pastikan semua ✅:

```
AUTHENTICATION & ACCESS:
[ ] Admin email: julyandapa@gmail.com - verified login
[ ] Password: Strong (min 12 chars, uppercase, number, symbol)
[ ] No hardcoded passwords di code
[ ] RLS (Row Level Security) enabled di Supabase

DATA PROTECTION:
[ ] Semua inputs di-sanitize (XSS protection)
[ ] SQL queries pakai ORM (SQL injection protection)
[ ] CORS configured untuk domain sendiri
[ ] HTTPS enabled (automatic di Vercel)

SECRETS & CREDENTIALS:
[ ] .env.local tidak di-commit ke Git
[ ] Environment variables set di production (Vercel)
[ ] PayPal Client ID = LIVE (bukan test/sandbox)
[ ] API keys tidak exposed di public

MONITORING & LOGGING:
[ ] console.log hanya di development
[ ] Error monitoring setup (Sentry/LogRocket)
[ ] Database backup dilakukan
[ ] Supabase logs aktif untuk monitoring

FINAL CHECKS:
[ ] npm run build - no errors
[ ] npm run preview - works locally
[ ] Test checkout dengan PayPal real
[ ] Test kontak form dengan email valid
[ ] AdminPage login dengan credentials correct
[ ] No sensitive data di browser localStorage
```

---

## **DEPLOYMENT WORKFLOW FINAL:**

```bash
# 1. Local testing
npm run build
npm run preview

# 2. Cleanup data
# - Hapus semua products test via Supabase
# - Hapus semua orders via Supabase

# 3. Push ke GitHub
git add .
git commit -m "Ready for production"
git push

# 4. Deploy ke Vercel
# - Connect GitHub repo
# - Set env variables di Vercel dashboard
# - Deployment automatic

# 5. Monitoring
# - Check Vercel logs
# - Monitor PayPal payments
# - Monitor Supabase logs
```

---

**Apakah Anda siap dengan semua ini? Ada yang ingin saya jelaskan lebih detail?** 🚀

## Data Structure Untuk Produksi

### Recommended Products Table:
```
- id: UUID (primary key)
- name: string (required)
- price: decimal (required)
- description: text
- image: URL string
- category: string
- sales_count: integer (default 0)
- created_at: timestamp
- updated_at: timestamp
```

### Admin Account:
```
- email: julyandapa@gmail.com
- role: admin
- verified: true
- created_at: [setup date]
```

## Support & Emergency

Jika ada issues:
1. Check `.env.local` setup
2. Verify Supabase connection
3. Check PayPal Live credentials
4. Monitor browser console untuk error
5. Check Supabase logs untuk database errors

---

**Status Check Before Deploying to Production:**
- [ ] All test data deleted
- [ ] Admin account verified
- [ ] Security measures in place
- [ ] Environment variables correct
- [ ] PayPal Live mode configured
- [ ] HTTPS ready
- [ ] Database backup completed
