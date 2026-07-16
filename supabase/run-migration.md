# Cara Menjalankan Migration

Ada 2 cara untuk menjalankan migration ini:

## Option 1: Melalui Supabase Dashboard (RECOMMENDED)

1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Buat new query
5. Copy paste isi file migration berikut **SECARA BERURUTAN**:
   - `20260716130000_fix_transaction_and_items_schema.sql`
   - `20260716131000_create_accessories_table.sql`
6. Klik **Run** untuk setiap file

## Option 2: Menggunakan Supabase CLI

Jika Anda sudah install Supabase CLI:

```bash
# Link project ke CLI (pertama kali saja)
supabase link --project-ref your-project-ref

# Push migrations ke database
supabase db push
```

## Option 3: Manual Query (Jika tidak ada akses CLI)

Jalankan query SQL berikut di Supabase Dashboard SQL Editor secara manual:

### File 1: Fix Transaction and Items Schema
```sql
-- Copy isi dari: migrations/20260716130000_fix_transaction_and_items_schema.sql
```

### File 2: Create Accessories Table
```sql
-- Copy isi dari: migrations/20260716131000_create_accessories_table.sql
```

## Verifikasi

Setelah menjalankan migration, verifikasi dengan query:

```sql
-- Check transaction_items columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transaction_items';

-- Check transactions columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions';

-- Check accessories table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'accessories';
```

## Troubleshooting

Jika ada error:
1. Pastikan urutan menjalankan migration benar
2. Backup database terlebih dahulu jika production
3. Jika ada constraint error, drop constraint yang conflict dulu
4. Hubungi tim jika masih error
