-- Menambahkan kolom emergency_contact ke tabel users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Membuat fungsi trigger untuk meng-copy data dari auth.users ke public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    -- Ambil dari metadata Google jika ada (nama lengkap)
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Memicu fungsi di atas setiap kali ada baris baru di tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
