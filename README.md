# 🚀 TaskFlow — Smart To-Do List dengan Sync

Aplikasi to-do list modern dengan fitur login, database cloud, dan sinkronisasi real-time antar perangkat. Dibangun dengan **Supabase** (gratis).

## ✨ Fitur

- 🔐 Login & Register (email + password)
- ☁️ Data tersimpan di cloud (Supabase PostgreSQL)
- 🔄 Real-time sync antar browser/HP
- 📂 6 Kategori (Kerja, Pribadi, Belanja, Kesehatan, Belajar, Lainnya)
- 🔴🟡🟢 3 Level Prioritas
- 📅 Deadline & deteksi terlambat
- 📋 Sub-tugas (hingga 10 per tugas)
- 🔍 Pencarian, filter, & sorting
- 📊 Progress tracking
- 🌙 Dark/Light mode
- 🎊 Animasi konfetti
- 📱 Responsif (desktop & mobile)

## 📋 Cara Setup (5 Menit)

### 1. Buat Akun Supabase (Gratis)

1. Buka [supabase.com](https://supabase.com) dan klik **Start your project**
2. Login dengan GitHub
3. Klik **New Project**
4. Isi:
   - **Name**: `taskflow`
   - **Database Password**: buat password kuat (simpan!)
   - **Region**: pilih yang terdekat (misal: Singapore)
5. Klik **Create new project** dan tunggu beberapa menit

### 2. Setup Database

1. Di dashboard Supabase, buka menu **SQL Editor** (ikon terminal di sidebar)
2. Klik **New query**
3. Copy-paste seluruh isi file `setup.sql` ke editor
4. Klik **Run** (atau Ctrl+Enter)
5. Pastikan muncul "Success. No rows returned"

### 3. Dapatkan API Keys

1. Buka menu **Settings** > **API** (atau **Project Settings** > **API**)
2. Catat dua nilai berikut:
   - **Project URL** → contoh: `https://abcdefgh.supabase.co`
   - **anon / public key** → string panjang yang dimulai `eyJ...`

### 4. Konfigurasi Aplikasi

1. Buka file `index.html` dengan text editor
2. Cari bagian `CONFIG` di bagian atas `<script>`:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Ganti dengan nilai dari langkah 3:
   ```javascript
   const SUPABASE_URL = 'https://abcdefgh.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
   ```
4. Simpan file

### 5. Jalankan Aplikasi

Buka `index.html` di browser — selesai! 🎉

> **Tips**: Untuk akses dari HP, kamu bisa host file ini secara gratis di:
> - [Netlify](https://netlify.com) — drag & drop folder
> - [Vercel](https://vercel.com) — deploy dari GitHub
> - [GitHub Pages](https://pages.github.com) — gratis dari repo

### 6. (Opsional) Matikan Konfirmasi Email untuk Testing

Secara default, Supabase mengharuskan konfirmasi email. Untuk mempermudah testing:

1. Buka **Authentication** > **Providers** > **Email**
2. Matikan toggle **Confirm email**
3. Klik **Save**

## 🔒 Keamanan

- Row Level Security (RLS) aktif: setiap user hanya bisa akses datanya sendiri
- Password di-hash oleh Supabase (bcrypt)
- Anon key aman untuk client-side (bukan secret key)
- Semua komunikasi melalui HTTPS

## 📁 Struktur File

```
taskflow/
├── index.html    ← Aplikasi utama (buka di browser)
├── setup.sql     ← SQL untuk setup database
└── README.md     ← Panduan ini
```

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Invalid API key" | Pastikan SUPABASE_ANON_KEY benar (bukan service_role key) |
| "Email not confirmed" | Matikan konfirmasi email di Supabase (lihat langkah 6) |
| Data tidak muncul | Pastikan SQL setup sudah dijalankan |
| Tidak bisa register | Cek apakah email format valid dan password min 6 karakter |
