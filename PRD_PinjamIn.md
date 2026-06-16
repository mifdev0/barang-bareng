# Product Requirements Document
## PinjamIn — Platform Marketplace Penyewaan Barang Fisik

| | |
|---|---|
| **Versi** | 1.0.0 — Draft Awal |
| **Tanggal** | Juni 2025 |
| **Status** | Menunggu Persetujuan Klien |
| **Tech Stack** | Next.js + Supabase (PostgreSQL) |
| **Budget** | Rp 100.000 |
| **Deadline** | Kamis (sesuai kesepakatan) |

---

## 1. Ringkasan Produk

PinjamIn adalah marketplace dua sisi (two-sided marketplace) yang menghubungkan penyedia barang sewaan (Owner) dengan pelanggan yang ingin menyewa (Customer). Platform berperan sebagai jembatan digital — Owner mendaftarkan barang dan toko mereka, Customer menemukan dan menyewa barang tersebut, sedangkan PinjamIn mendapat komisi 10% dari setiap transaksi.

| Aspek | Detail |
|---|---|
| **Nama Platform** | PinjamIn |
| **Kategori** | E-commerce / Marketplace Rental |
| **Target Pengguna** | Owner usaha rental + Customer penyewa |
| **Model Bisnis** | Komisi 10% dari setiap transaksi sewa |
| **Pembayaran** | Transfer manual ke rekening PinjamIn, konfirmasi manual |
| **MVP Timeline** | Kamis (sesuai kesepakatan) |

---

## 2. Peran Pengguna (User Roles)

Terdapat 3 aktor utama dalam sistem ini.

### 2.1 Customer (Penyewa)
- Mendaftar / login ke platform
- Browse katalog barang dari berbagai toko
- Melihat detail barang: spesifikasi, harga sewa per hari, foto
- Menghubungi Owner via in-app chat untuk negosiasi harga
- Melakukan pemesanan sewa setelah deal dengan Owner
- Upload bukti transfer pembayaran
- Melihat status order (menunggu konfirmasi, aktif, selesai)

### 2.2 Owner (Penyedia Barang)
- Mendaftar / login ke platform
- Membuat dan mengelola 1 atau lebih toko (multi-toko per akun)
- Menambah, mengedit, menghapus listing barang dalam toko
- Mengatur harga sewa default per barang
- Menerima dan membalas chat dari Customer
- Mengubah harga khusus untuk Customer tertentu dalam satu sesi chat (harga negosiasi)
- Mengkonfirmasi bukti transfer dari Customer
- Mengelola status ketersediaan barang

### 2.3 Admin / Developer Platform
- Melihat semua transaksi yang masuk
- Melihat saldo komisi yang harus diterima dari setiap transaksi
- Memverifikasi dan mengelola data toko dan barang (moderasi)
- Akses dashboard laporan transaksi

---

## 3. Fitur Utama (MVP)

### 3.1 Autentikasi & Profil
- Register & Login dengan email + password (via Supabase Auth)
- Pilih role saat register: Customer atau Owner
- Halaman profil: edit nama, foto, kontak
- Session management otomatis oleh Supabase

### 3.2 Manajemen Toko (Owner)
- Satu akun Owner bisa memiliki beberapa toko berbeda
- Setiap toko punya: nama toko, deskripsi, foto banner, kategori, dan lokasi
- Owner bisa aktif/nonaktifkan toko

### 3.3 Katalog Barang
- Setiap barang memiliki: nama, foto (multiple), deskripsi, spesifikasi teknis, harga sewa per hari, stok tersedia, kategori
- Customer bisa filter dan search berdasarkan kategori / nama barang / kota
- Halaman detail barang menampilkan semua informasi + tombol "Hubungi Owner"

### 3.4 In-App Chat & Negosiasi
- Percakapan langsung antara Customer dan Owner di dalam platform
- Owner dapat mengubah harga penawaran khusus untuk Customer tertentu langsung dari halaman chat
- Setelah harga deal, Owner bisa membuat Order dari halaman chat tersebut
- Riwayat chat tersimpan per pasangan Customer–Owner

### 3.5 Pemesanan (Order)
- Order dibuat setelah harga disepakati via chat
- Detail order: barang, tanggal mulai–selesai, durasi, harga final, breakdown komisi platform
- Status order: `Menunggu Pembayaran` → `Pembayaran Dikirim` → `Dikonfirmasi` → `Aktif` → `Selesai`
- Customer upload bukti transfer (screenshot/foto)
- Owner konfirmasi penerimaan pembayaran

### 3.6 Sistem Pembayaran & Komisi

Karena budget terbatas, sistem pembayaran menggunakan transfer manual.

| Langkah | Deskripsi |
|---|---|
| 1 | Customer transfer total sewa ke rekening PinjamIn (bukan Owner langsung) |
| 2 | Customer upload bukti transfer di halaman order |
| 3 | Owner verifikasi dan konfirmasi di sistem |
| 4 | Sistem otomatis kalkulasi: bagian Owner (harga sewa − 10% komisi) dan bagian PinjamIn (10%) |
| 5 | PinjamIn mentransfer bagian Owner sesuai saldo yang terkalkulasi |

**Rekening PinjamIn:**

| Metode | Nomor |
|---|---|
| BCA | 8179035726 |
| DANA / GoPay | 081354496995 |

### 3.7 Dashboard

**Dashboard Customer**
- Daftar order aktif dan riwayat order
- Status pembayaran tiap order
- Akses riwayat chat

**Dashboard Owner**
- Daftar toko dan barang
- Daftar order masuk beserta status
- Saldo komisi yang harus dibayar ke platform
- Riwayat transaksi per toko

**Dashboard Admin (Developer)**
- Total transaksi platform
- Total komisi terkumpul
- Daftar semua order dan statusnya
- Manajemen user & toko

---

## 4. Skema Database (High-Level)

| Tabel | Kolom Utama | Keterangan |
|---|---|---|
| `users` | id, email, role, name, avatar | Customer & Owner (Supabase Auth) |
| `stores` | id, owner_id, name, description, category, city, is_active | Multi-toko per Owner |
| `items` | id, store_id, name, description, specs, price_per_day, stock, photos[] | Barang rental |
| `chats` | id, customer_id, owner_id, item_id | Thread percakapan |
| `messages` | id, chat_id, sender_id, content, type, negotiated_price | Pesan + harga nego |
| `orders` | id, chat_id, item_id, customer_id, owner_id, start_date, end_date, total_price, commission, status | Transaksi sewa |
| `payments` | id, order_id, proof_url, confirmed_at, confirmed_by | Bukti transfer |

---

## 5. Alur Utama Pengguna

### 5.1 Alur Customer Menyewa

| # | Langkah | Halaman/Fitur |
|---|---|---|
| 1 | Buka platform → Browse katalog barang | Homepage / Katalog |
| 2 | Pilih barang yang diinginkan | Halaman Detail Barang |
| 3 | Klik "Hubungi Owner" → Mulai chat | In-App Chat |
| 4 | Negosiasi harga (opsional) | Chat — Owner ubah harga khusus |
| 5 | Sepakat harga → Owner buat Order | Halaman Order |
| 6 | Customer transfer ke rekening PinjamIn | Manual (info rekening tampil di order) |
| 7 | Customer upload bukti transfer | Halaman Order → Upload |
| 8 | Owner konfirmasi → Status jadi Aktif | Dashboard Owner |
| 9 | Barang dikirim/diambil, sewa berjalan | — |
| 10 | Selesai → Status order Selesai | Dashboard Customer & Owner |

### 5.2 Alur Owner Mendaftarkan Barang

| # | Langkah |
|---|---|
| 1 | Register sebagai Owner |
| 2 | Buat toko (nama, deskripsi, kategori, kota) |
| 3 | Tambah barang ke toko (foto, spek, harga, stok) |
| 4 | Toko aktif → Barang tampil di katalog |
| 5 | Terima chat & order dari Customer |

---

## 6. Teknologi yang Digunakan

| Komponen | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR + performa baik, ekosistem luas |
| Styling | Tailwind CSS | Cepat, ringan, konsisten |
| Backend / Database | Supabase (PostgreSQL) | Auth, DB, Storage, Realtime bawaan |
| Real-time Chat | Supabase Realtime | WebSocket tanpa backend tambahan |
| File Storage | Supabase Storage | Upload foto barang & bukti transfer |
| Deployment | Vercel + Supabase Cloud | Free tier mencukupi untuk MVP |
| Auth | Supabase Auth | Email/password, session management |

---

## 7. Di Luar Scope MVP

Fitur berikut tidak dikerjakan di MVP dan dapat dipertimbangkan untuk versi berikutnya:

- Payment gateway otomatis (Midtrans, Xendit, dll.)
- Sistem review dan rating
- Notifikasi email / push notification
- Fitur pencarian dengan peta / geolocation
- Mobile app (Android/iOS native)
- Fitur dispute / komplain formal
- Ekspor laporan keuangan
- Integrasi logistik / pengiriman

---

## 8. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Konfirmasi pembayaran manual lambat | Customer kecewa | Beri batas waktu konfirmasi 24 jam, notifikasi in-app |
| Owner tidak aktif / tidak respon chat | Customer kabur | Tampilkan badge "Aktif" / waktu respons rata-rata |
| Bukti transfer palsu | Kerugian Owner | Owner tetap jadi pihak yang memverifikasi; edukasi user |
| Database overload (free tier Supabase) | Platform lambat | Optimasi query, limit data per request, pagination |
| Deadline ketat | Fitur tidak selesai | Prioritaskan: Auth → Katalog → Chat → Order → Payment |

---

## 9. Prioritas Pengerjaan (Sprint Order)

| Prioritas | Fitur | Estimasi |
|---|---|---|
| P0 — Wajib MVP | Auth (register/login + role) | 4 jam |
| P0 — Wajib MVP | Katalog barang & detail item | 6 jam |
| P0 — Wajib MVP | Multi-toko Owner + manajemen barang | 5 jam |
| P0 — Wajib MVP | In-app chat + negosiasi harga | 8 jam |
| P0 — Wajib MVP | Order + upload bukti transfer | 6 jam |
| P0 — Wajib MVP | Konfirmasi Owner + kalkulasi komisi | 4 jam |
| P1 — Nice to have | Dashboard ringkasan (Customer & Owner) | 4 jam |
| P1 — Nice to have | Admin panel sederhana | 3 jam |
| P2 — Opsional | Search & filter katalog | 3 jam |

---

## 10. Asumsi & Kesepakatan Awal

- Komisi platform ditetapkan **10% per transaksi** — sudah disepakati
- Rekening tujuan transfer: **BCA 8179035726** dan **DANA/GoPay 081354496995**
- Nama pemilik rekening (A/N) belum dikonfirmasi — perlu dilengkapi sebelum launch
- Design UI mengikuti referensi yang akan diberikan klien (belum diterima saat PRD ini dibuat)
- Deployment awal menggunakan free tier Vercel + Supabase; biaya infrastruktur Rp 0 untuk MVP
- Tidak ada SLA resmi untuk MVP — ini adalah proof-of-concept / demo
- Chat bersifat one-on-one (Customer ↔ Owner per barang), bukan group chat

---

*Dokumen ini bersifat draf dan dapat direvisi berdasarkan feedback klien.*
