-- =========================================================================
-- SQL UTILITY: MENGUBAH ROLE AKUN DI DATABASE SUPABASE
-- =========================================================================
-- Petunjuk Penggunaan:
-- 1. Buka Supabase Dashboard proyek Anda.
-- 2. Pilih menu "SQL Editor" di panel kiri.
-- 3. Copy query di bawah ini sesuai kebutuhan, lalu tekan tombol "Run".
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. JADIKAN ADMIN (Ubah role akun tertentu menjadi Admin)
-- -------------------------------------------------------------------------
UPDATE public.profiles
SET role = 'Admin'
WHERE email = 'email_user_anda@gmail.com';


-- -------------------------------------------------------------------------
-- 2. JADIKAN OWNER (Ubah role akun tertentu menjadi Owner/Pemilik Toko)
-- -------------------------------------------------------------------------
UPDATE public.profiles
SET role = 'Owner'
WHERE email = 'email_user_anda@gmail.com';


-- -------------------------------------------------------------------------
-- 3. JADIKAN CUSTOMER (Ubah role akun tertentu menjadi Customer/Penyewa)
-- -------------------------------------------------------------------------
UPDATE public.profiles
SET role = 'Customer'
WHERE email = 'email_user_anda@gmail.com';


-- -------------------------------------------------------------------------
-- 4. CEK DAFTAR USER & ROLE SAAT INI
-- -------------------------------------------------------------------------
SELECT id, email, name, role, created_at
FROM public.profiles
ORDER BY created_at DESC;


-- -------------------------------------------------------------------------
-- 5. UPGRADE DATABASE: TAMBAH KOLOM JAMINAN IDENTITAS CUSTOMER (KTP)
-- -------------------------------------------------------------------------
-- Jalankan ini di SQL Editor jika database Anda sudah terbentuk sebelumnya,
-- agar tabel orders mendukung penyimpanan link foto jaminan identitas.
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS identity_proof_url text;
