// Verifikasi asumsi kritis fix P2028:
//  1. createManyAndReturn mengembalikan id SESUAI URUTAN INPUT (kalau tidak,
//     set bisa nyangkut ke gerakan yang salah).
//  2. Pola 3-query bulk muat dalam batas waktu transaksi (sebelumnya 19-47 query gagal).
// SEMUA tulis-menulis DIBATALKAN (transaction sengaja di-throw di akhir) — nol side effect.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });
  if (!user) throw new Error('tidak ada user untuk uji');
  const exs = await prisma.exercise.findMany({ take: 9, select: { id: true, name: true } });
  if (exs.length < 3) throw new Error('butuh minimal 3 gerakan');

  console.log('uji dengan', exs.length, 'gerakan (sesi 9 gerakan = kasus user)\n');

  const t0 = Date.now();
  let cek = null;
  try {
    await prisma.$transaction(
      async (tx) => {
        const session = await tx.workoutSession.create({
          data: {
            userId: user.id,
            name: '__UJI_ROLLBACK__',
            startedAt: new Date(),
            endedAt: new Date(),
            durationSec: 60,
            totalVolume: 0,
            isCompleted: true,
          },
        });

        const created = await tx.sessionExercise.createManyAndReturn({
          data: exs.map((e, i) => ({
            workoutSessionId: session.id,
            userId: user.id,
            exerciseId: e.id,
            sortOrder: i + 1,
            performedAt: new Date(),
          })),
          select: { id: true, exerciseId: true },
        });

        // Verifikasi urutan: id ke-i harus milik exerciseId ke-i
        const orderOk = created.every((c, i) => c.exerciseId === exs[i].id);

        const setRows = [];
        for (let i = 0; i < exs.length; i++) {
          for (let s = 0; s < 4; s++) {
            setRows.push({
              sessionExerciseId: created[i].id,
              userId: user.id,
              exerciseId: exs[i].id,
              setNumber: s + 1,
              weight: 20 + i,
              reps: 10,
              estimated1RM: 20 + i,
              isCompleted: true,
              performedAt: new Date(),
            });
          }
        }
        const ins = await tx.setLog.createMany({ data: setRows });

        cek = { orderOk, insertedSets: ins.count, exercises: created.length };
        throw new Error('__ROLLBACK__'); // batalkan semua
      },
      { timeout: 15_000 }
    );
  } catch (e) {
    if (e.message !== '__ROLLBACK__') {
      console.log('GAGAL setelah', Date.now() - t0, 'ms');
      console.log('  kode:', e.code, '| pesan:', String(e.message).slice(0, 160));
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  console.log('transaksi 3-query bulk selesai dalam', Date.now() - t0, 'ms  (batas 15000)');
  console.log('urutan id sesuai input :', cek.orderOk ? 'YA ✓' : 'TIDAK ✗ — fix tidak aman!');
  console.log('sessionExercise dibuat:', cek.exercises);
  console.log('setLog dibuat          :', cek.insertedSets, '(terharap di-rollback)');

  const left = await prisma.workoutSession.count({ where: { name: '__UJI_ROLLBACK__' } });
  console.log('sisa data uji di DB    :', left === 0 ? '0 ✓ (rollback bersih)' : left + ' ✗');

  await prisma.$disconnect();
  process.exit(cek.orderOk && left === 0 ? 0 : 1);
})().catch((e) => {
  console.error('FATAL:', e.code || '', String(e.message).slice(0, 200));
  process.exit(1);
});
