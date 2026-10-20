// Verifikasi logika pengingat "sudah lama tidak dilatih" dengan DATA NYATA.
// Sekaligus membuktikan aturannya masuk akal: program yang baru dilatih tidak
// muncul, program yang lama tidak disentuh muncul, program kosong/baru diabaikan.
// Hanya BACA.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TUJUH_HARI = 7 * 24 * 3600 * 1000;

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, isCompleted: true },
    select: { startedAt: true, program: { select: { id: true } } },
    orderBy: { startedAt: 'desc' },
  });
  const programAktif = await prisma.program.findMany({
    where: { userId: user.id, isArchived: false },
    select: { id: true, name: true, createdAt: true, _count: { select: { exercises: true } } },
  });

  console.log('sesi selesai:', sessions.length, '| program aktif:', programAktif.length);
  console.log('sesi terakhir per program:');
  for (const p of programAktif) {
    const s = sessions.find((x) => x.program?.id === p.id);
    const hariLalu = s ? Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 86400000) : null;
    console.log('  ' + p.name.padEnd(12) + ' gerakan=' + p._count.exercises +
      '  dibuat=' + Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000) + 'hr lalu' +
      '  sesiTerakhir=' + (hariLalu === null ? 'BELUM PERNAH' : hariLalu + 'hr lalu'));
  }

  // Replika aturan di riwayat-actions.ts
  const muncul = [];
  const tujuhHariLalu = new Date(Date.now() - TUJUH_HARI);
  const tenggangBaru = new Date(Date.now() - 3 * 86400000);
  for (const p of programAktif) {
    if (p.createdAt >= tenggangBaru) continue;                   // baru dibuat
    if (p._count.exercises === 0) continue;                      // program kosong
    const s = sessions.find((x) => x.program?.id === p.id);
    if (s) {
      const selisih = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 86400000);
      if (selisih < 7) continue;                                 // baru dilatih
      muncul.push(p.name + ' (' + selisih + ' hari lalu)');
    } else {
      muncul.push(p.name + ' (belum pernah dilatih)');
    }
  }
  console.log('\npengingat yang MUNCUL di halaman Riwayat:');
  if (muncul.length === 0) console.log('  (tidak ada)');
  for (const m of muncul) console.log('  - ' + m);

  // Uji batas: aturan harus konsisten di tiga skenario buatan
  const uji = (label, prog, sesi) => {
    const aturan = () => {
      if (prog.createdAt >= tenggangBaru) return false;
      if (prog.exercises === 0) return false;
      if (sesi === null) return true;
      return Math.floor((Date.now() - sesi) / 86400000) >= 7;
    };
    return { label, hasil: aturan() };
  };
  const hari = (n) => new Date(Date.now() - n * 86400000);
  const cek = [
    uji('program lama, terakhir 10 hari lalu', { createdAt: hari(60), exercises: 5 }, hari(10)),
    uji('program lama, terakhir 3 hari lalu', { createdAt: hari(60), exercises: 5 }, hari(3)),
    uji('program lama, belum pernah', { createdAt: hari(60), exercises: 5 }, null),
    uji('program BARU dibuat (2 hari)', { createdAt: hari(2), exercises: 5 }, null),
    uji('program KOSONG', { createdAt: hari(60), exercises: 0 }, null),
    uji('dibuat 5 hari lalu, belum pernah (kasus nyata)', { createdAt: hari(5), exercises: 8 }, null),
  ];
  const harap = [true, false, true, false, false, true];
  console.log('\nuji batas:');
  let ok = true;
  cek.forEach((c, i) => {
    const lulus = c.hasil === harap[i];
    if (!lulus) ok = false;
    console.log('  ' + (lulus ? 'OK  ' : 'FAIL') + ' ' + c.label.padEnd(38) + ' muncul=' + c.hasil + ' harap=' + harap[i]);
  });
  console.log(ok ? '\n=> LOGIKA PENGINGAT BENAR' : '\n=> ADA YANG SALAH');

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FATAL:', e.code || e.message); process.exit(1); });
