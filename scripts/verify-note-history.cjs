// Verifikasi end-to-end fitur catatan per gerakan:
//  1. Simpan sesi dengan catatan gerakan (pola bulk yang dipakai produksi).
//  2. Baca kembali dengan query noteHistory PERSIS seperti di kode
//     (orderBy performedAt desc, notes not null, take 5) — pastikan catatan terbaca.
//  3. Pastikan catatan kosong/spasi TIDAK ikut terbaca.
// SEMUA tulis dibatalkan (transaction sengaja di-throw) — nol side effect.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });
  if (!user) throw new Error('tidak ada user');
  const exs = await prisma.exercise.findMany({ take: 2, select: { id: true, name: true } });

  let hasil = null;
  try {
    await prisma.$transaction(
      async (tx) => {
        // Dua sesi: sesi lama (catatan) + sesi baru (catatan + satu catatan spasi)
        const sesiLama = await tx.workoutSession.create({
          data: {
            userId: user.id, name: '__UJI_CATATAN_LAMA__', startedAt: new Date(Date.now() - 86400000),
            endedAt: new Date(Date.now() - 82800000), durationSec: 3600, totalVolume: 0, isCompleted: true,
          },
        });
        const sesiBaru = await tx.workoutSession.create({
          data: {
            userId: user.id, name: '__UJI_CATATAN_BARU__', startedAt: new Date(),
            endedAt: new Date(), durationSec: 600, totalVolume: 0, isCompleted: true,
          },
        });

        const [seLama] = await tx.sessionExercise.createManyAndReturn({
          data: [{ workoutSessionId: sesiLama.id, userId: user.id, exerciseId: exs[0].id, sortOrder: 1, notes: 'sesi lama: pin no. 5, bahu kiri nyeri' }],
          select: { id: true },
        });
        const [seBaru] = await tx.sessionExercise.createManyAndReturn({
          data: [
            { workoutSessionId: sesiBaru.id, userId: user.id, exerciseId: exs[0].id, sortOrder: 1, notes: 'sesi baru: ganti grip lebar' },
            { workoutSessionId: sesiBaru.id, userId: user.id, exerciseId: exs[1].id, sortOrder: 2, notes: '   ' }, // spasi saja
          ],
          select: { id: true },
        });

        // ---- Query PERSIS seperti di getExerciseHistoryForUser ----
        const rows = await tx.sessionExercise.findMany({
          where: { userId: user.id, exerciseId: exs[0].id, notes: { not: null }, workoutSession: { isCompleted: true } },
          orderBy: { performedAt: 'desc' },
          take: 5,
          select: { performedAt: true, notes: true },
        });
        const noteHistory = rows
          .map((se) => ({ date: se.performedAt, notes: (se.notes || '').trim() }))
          .filter((n) => n.notes.length > 0)
          .slice(0, 5);

        // Cek gerakan kedua: catatan spasi saja harus menghasilkan noteHistory kosong
        const rows2 = await tx.sessionExercise.findMany({
          where: { userId: user.id, exerciseId: exs[1].id, notes: { not: null }, workoutSession: { isCompleted: true } },
          orderBy: { performedAt: 'desc' }, take: 5, select: { performedAt: true, notes: true },
        });
        const noteHistory2 = rows2.map((s) => ({ notes: (s.notes || '').trim() })).filter((n) => n.notes.length > 0);

        hasil = { noteHistory, noteHistory2, namaGerakan: exs[0].name, sesiLamaId: seLama.id, seBaruId: seBaru.id };
        throw new Error('__ROLLBACK__');
      },
      { timeout: 15000 }
    );
  } catch (e) {
    if (e.message !== '__ROLLBACK__') {
      console.log('GAGAL:', e.code || '', String(e.message).slice(0, 200));
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  console.log('gerakan uji:', hasil.namaGerakan);
  console.log('noteHistory terbaca:', hasil.noteHistory.length, 'entri');
  hasil.noteHistory.forEach((n) => console.log('   •', new Date(n.date).toISOString().slice(0, 10), '->', n.notes));
  console.log('\nurut terbaru dulu :', hasil.noteHistory[0].notes.startsWith('sesi baru') ? 'YA ✓' : 'TIDAK ✗');
  console.log('catatan spasi saja diabaikan:', hasil.noteHistory2.length === 0 ? 'YA ✓' : 'TIDAK ✗');

  const sisa = await prisma.workoutSession.count({ where: { name: { startsWith: '__UJI_CATATAN' } } });
  console.log('sisa data uji di DB:', sisa === 0 ? '0 ✓ (rollback bersih)' : sisa + ' ✗');

  await prisma.$disconnect();
  const ok = hasil.noteHistory.length === 2 && hasil.noteHistory[0].notes.startsWith('sesi baru') && hasil.noteHistory2.length === 0 && sisa === 0;
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FATAL:', String(e.message).slice(0, 200)); process.exit(1); });
