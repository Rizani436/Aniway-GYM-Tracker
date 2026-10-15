import { createClient } from '@/lib/supabase/client';

const BUCKET = 'exercise-images';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** Upload foto gerakan dari browser ke Supabase Storage. Return public URL. */
export async function uploadExerciseImage(
  file: File,
  userId: string
): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Format harus JPG, PNG, atau WebP.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Ukuran maksimal 2 MB.');
  }
  const ext =
    file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000', // immutable — nama file unik per upload
    upsert: false,
  });
  if (error) throw new Error(`Gagal upload gambar: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
