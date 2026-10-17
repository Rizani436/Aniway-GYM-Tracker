// Verifikasi isi gerakan baru yang SUDAH masuk DB: apakah benar Bahasa Indonesia,
// lengkap, dan gambarnya ada. Menangkap konten Inggris yang lolos atau field kosong.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const baru = await prisma.exercise.findMany({
    where: { userId: null, isArchived: false },
    select: { name: true, steps: true, tips: true, commonMistakes: true, imageUrl: true, equipment: true, primaryMuscle: true, weightIncrement: true },
    orderBy: { name: 'asc' },
  });

  const masalah = [];
  // Kata umum Inggris yang menandakan teks belum diterjemahkan
  const EN = /\b(the|your|with|while|keep|make sure|hold|lower|raise|repeat|slowly|back|down|up|and then|should|must|do not|don't)\b/i;

  for (const e of baru) {
    if (!e.steps?.length || e.steps.length < 3) masalah.push(`${e.name}: steps < 3`);
    if (!e.tips?.length || e.tips.length < 2) masalah.push(`${e.name}: tips < 2`);
    if (!e.commonMistakes?.length || e.commonMistakes.length < 2) masalah.push(`${e.name}: mistakes < 2`);
    const semua = [...(e.steps || []), ...(e.tips || []), ...(e.commonMistakes || [])];
    const inggris = semua.filter((s) => EN.test(s) && !/dumbbell|barbell|core|set|rep|grip|box|band|hook|front squat|dips/i.test(s));
    if (inggris.length) masalah.push(`${e.name}: mungkin Inggris -> "${inggris[0].slice(0, 60)}"`);
    if (e.weightIncrement <= 0) masalah.push(`${e.name}: increment ${e.weightIncrement}`);
  }

  console.log('total gerakan:', baru.length);
  console.log('bergambar:', baru.filter((e) => e.imageUrl).length);
  console.log('tanpa gambar:', baru.filter((e) => !e.imageUrl).map((e) => e.name).join(', ') || 'tidak ada');
  console.log('total butir konten:', baru.reduce((a, e) => a + e.steps.length + e.tips.length + e.commonMistakes.length, 0));
  console.log('\nMASALAH DITEMUKAN:', masalah.length);
  masalah.forEach((m) => console.log('  !', m));

  // Sampel nyata dari gerakan baru
  const contoh = baru.filter((e) => ['Chin-Up', 'Barbell Full Squat', 'Hammer Curls', 'Farmer\'s Walk'].includes(e.name));
  for (const c of contoh) {
    console.log(`\n--- ${c.name} [${c.primaryMuscle}/${c.equipment}, +${c.weightIncrement}kg] ---`);
    console.log('  gambar:', c.imageUrl ? 'ADA' : 'TIDAK');
    console.log('  langkah 1:', c.steps[0]?.slice(0, 110));
    console.log('  tips 1  :', c.tips[0]?.slice(0, 110));
    console.log('  salah 1 :', c.commonMistakes[0]?.slice(0, 110));
  }

  await prisma.$disconnect();
  process.exit(masalah.length === 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL:', String(e.message).slice(0, 150)); process.exit(1); });
