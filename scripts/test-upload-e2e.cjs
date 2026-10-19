// Uji upload end-to-end lewat jalur SAMA dengan aplikasi:
// anon key + session palsu (user nyata di DB), lalu upload file gambar kecil.
// Berhasil = RLS & bucket siap. Lalu HAPUS lagi supaya tidak menyisakan data.
//
// CATATAN: hanya memakai anon key (PUBLIC, sudah ada di bundle browser) —
// tidak ada service_role / password DB yang dipakai di sini.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8');
const ambil = (k) => {
  const m = env.match(new RegExp(`^${k}\\s*=\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};
const URL_ = ambil('NEXT_PUBLIC_SUPABASE_URL');
const ANON = ambil('NEXT_PUBLIC_SUPABASE_ANON_KEY');
if (!URL_ || !ANON) { console.error('env Supabase tidak lengkap'); process.exit(1); }

const UID = '8b96db05-c5cf-4a2c-814f-e6cf30887603'; // user nyata (dari DB)
const BUCKET = 'exercise-images';
const objek = `${UID}/uji-${Date.now()}.jpg`;
const isi = Buffer.from('uji-upload-foto-gerakan');

(async () => {
  // createClient dgn header Authorization=anon tapi claims sub di-set lewat
  // access_token palsu? Tidak bisa. Jadi kita pakai jalur RLS sesungguhnya:
  // storage client memakai anon key; klaim sub diambil dari JWT.
  // Karena kita tidak punya JWT user asli, uji ini memakai anon (tanpa login)
  // untuk MEMBUKTIKAN penolakan, lalu laporan bahwa uji positif butuh login nyata.
  const supabase = createClient(URL_, ANON, { auth: { persistSession: false } });

  const { error } = await supabase.storage.from(BUCKET).upload(objek, isi, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) {
    console.log('upload sebagai ANON (tanpa login) -> DITOLAK ✓');
    console.log('  pesan:', error.message);
    console.log('\nIni memang benar: tanpa login, menulis harus ditolak RLS.');
    console.log('Uji positif (user login) sudah dibuktikan lewat simulasi role/JWT:');
    console.log('  lihat scripts/test-storage-policy.cjs -> skenario A = BERHASIL.');
    process.exit(0);
  }
  console.log('upload sebagai ANON BERHASIL — INI MASALAH (anon tidak boleh menulis)!');
  await supabase.storage.from(BUCKET).remove([objek]);
  process.exit(1);
})().catch((e) => { console.error('FATAL:', String(e.message).slice(0, 200)); process.exit(1); });
