// KOREKSI DATA LAMA: tandai ulang set PR dengan aturan baru (satu PR per gerakan
// per sesi = set kerja dengan 1RM tertinggi).
//
// Kenapa perlu: sebelum perbaikan, beberapa set dalam satu sesi bisa sama-sama
// ditandai PR bila bebannya menanjak. Akibatnya halaman "Rekor Pribadi" bisa
// menampilkan gerakan dengan rekor dari set yang bukan yang tertinggi, dan
// hitungan PR menggelembung.
//
// AMAN: hanya menyentuh kolom isPersonalRecord. Tidak menghapus/menambah baris.
// Jalankan dengan --apply untuk benar-benar menulis; tanpa itu hanya laporan.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');
const SetType = { WARMUP: 'WARMUP' };

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });
  const sesi = await prisma.workoutSession.findMany({
    where: { userId: user.id, isCompleted: true },
    select: { id: true, name: true, startedAt: true },
    orderBy: { startedAt: 'asc' },
  });

  let totalDiperiksa = 0;
  let totalDitandaiUlang = 0;
  const perubahan = [];

  for (const s of sesi) {
    const sets = await prisma.setLog.findMany({
      where: { sessionExercise: { workoutSessionId: s.id } },
      select: { id: true, exerciseId: true, setNumber: true, weight: true, reps: true, setType: true, isCompleted: true, isPersonalRecord: true },
      orderBy: { setNumber: 'asc' },
    });

    // Kelompokkan per gerakan di sesi ini
    const per = {};
    for (const x of sets) (per[x.exerciseId] ||= []).push(x);

    for (const [exId, daftar] of Object.entries(per)) {
      totalDiperiksa += daftar.length;
      const kerja = daftar
        .map((x, i) => ({ x, i }))
        .filter(({ x }) => x.isCompleted && x.setType !== SetType.WARMUP && x.weight > 0 && x.reps > 0)
        .map(({ x, i }) => ({ x, i, est: Math.round(x.weight * (1 + x.reps / 30) * 10) / 10 }));

      if (kerja.length === 0) continue;
      const maxEst = Math.max(...kerja.map((k) => k.est));

      // Dalam satu sesi, HANYA set dengan 1RM tertinggi yang boleh bertanda PR —
      // tapi hanya bila memang ada yang bertanda (artinya ini sesi yang memecahkan
      // rekor seumur latihan saat itu). Kita tidak menambah PR baru di sini.
      const adaYangBertanda = kerja.some((k) => k.x.isPersonalRecord);
      if (!adaYangBertanda) continue;

      const idSeharusnya = kerja.find((k) => k.est === maxEst).x.id;

      for (const k of kerja) {
        const seharusnya = k.x.id === idSeharusnya;
        if (k.x.isPersonalRecord !== seharusnya) {
          totalDitandaiUlang++;
          perubahan.push({
            id: k.x.id,
            sesi: s.name,
            set: k.x.setNumber,
            detail: k.x.weight + 'kg x ' + k.x.reps + ' (1RM ' + k.est + ')',
            dari: k.x.isPersonalRecord,
            ke: seharusnya,
          });
        }
      }
    }
  }

  console.log('sesi diperiksa     :', sesi.length);
  console.log('set diperiksa      :', totalDiperiksa);
  console.log('set perlu dikoreksi:', totalDitandaiUlang);
  if (perubahan.length) {
    console.log('\nrincian:');
    for (const p of perubahan) {
      console.log('  ' + p.sesi + ' set ' + p.set + ': ' + p.detail + '  ' + p.dari + ' -> ' + p.ke);
    }
  }

  if (!APPLY) {
    console.log('\n(DRY RUN — tidak ada yang ditulis. Jalankan dengan --apply untuk menerapkan.)');
    await prisma.$disconnect();
    return;
  }

  for (const p of perubahan) {
    await prisma.setLog.update({ where: { id: p.id }, data: { isPersonalRecord: p.ke } });
  }
  const prSesudah = await prisma.setLog.count({ where: { userId: user.id, isPersonalRecord: true } });
  console.log('\nDITERAPKAN. Total set PR sekarang:', prSesudah);
  await prisma.$disconnect();
})().catch((e) => { console.error('FATAL:', e.code || e.message); process.exit(1); });
