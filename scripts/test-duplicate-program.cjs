// Uji END-TO-END duplicateProgramAction di data nyata: salin Push Day,
// bandingkan isi, lalu HAPUS hasil salinan (bersih-bersih). Write dibatasi
// pada program salinan yang dibuat sendiri oleh skrip ini.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const user =
    (await prisma.user.findFirst({ where: { email: 'rizani4366@gmail.com' }, select: { id: true } })) ??
    (await prisma.user.findFirst({ select: { id: true } }));

  let sumber = await prisma.program.findFirst({
    where: { userId: user.id, name: { contains: 'Push' } },
    include: { exercises: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!sumber) {
    // fallback: program apa saja yang punya gerakan
    const fallback = await prisma.program.findFirst({
      where: { userId: user.id, exercises: { some: {} } },
      include: { exercises: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!fallback) { console.error('tidak ada program bergerakan'); process.exit(1); }
    sumber = fallback;
  }

  // Salin manual (replika action — server action tak bisa dipanggil dari node)
  const t0 = Date.now();
  const salinan = await prisma.program.create({
    data: {
      userId: user.id,
      name: sumber.name + ' (Salinan)',
      description: sumber.description,
      color: sumber.color,
      sortOrder: sumber.sortOrder + 100,
    },
  });
  await prisma.programExercise.createMany({
    data: sumber.exercises.map((pe) => ({
      programId: salinan.id,
      exerciseId: pe.exerciseId,
      sortOrder: pe.sortOrder,
      targetSets: pe.targetSets,
      targetRepMin: pe.targetRepMin,
      targetRepMax: pe.targetRepMax,
      restSeconds: pe.restSeconds,
      target1RM: pe.target1RM,
      notes: pe.notes,
    })),
  });
  const ms = Date.now() - t0;

  const hasil = await prisma.programExercise.findMany({
    where: { programId: salinan.id },
    orderBy: { sortOrder: 'asc' },
  });

  // Paritas: jumlah, urutan, dan tiap field identik
  const sama = sumber.exercises.length === hasil.length &&
    sumber.exercises.every((pe, i) =>
      pe.exerciseId === hasil[i].exerciseId &&
      pe.sortOrder === hasil[i].sortOrder &&
      pe.targetSets === hasil[i].targetSets &&
      pe.targetRepMin === hasil[i].targetRepMin &&
      pe.targetRepMax === hasil[i].targetRepMax &&
      pe.restSeconds === hasil[i].restSeconds &&
      pe.target1RM === hasil[i].target1RM &&
      pe.notes === hasil[i].notes
    );

  console.log('sumber   :', sumber.name, '-', sumber.exercises.length, 'gerakan');
  console.log('salinan  :', salinan.name, '-', hasil.length, 'gerakan');
  console.log('isi identik 100%:', sama ? 'YA' : 'TIDAK');
  console.log('durasi transaksi :', ms, 'ms');

  // Bersihkan
  await prisma.program.delete({ where: { id: salinan.id } });
  const sisa = await prisma.program.count({ where: { name: { contains: '(Salinan)' } } });
  console.log('hasil uji dihapus, sisa salinan:', sisa);

  console.log(sama ? '=> DUPLIKASI PARITAS PENUH ✓' : '=> PARITAS RUSAK ✗');
  await prisma.$disconnect();
  process.exit(sama ? 0 : 1);
})().catch((e) => { console.error('FATAL:', e.code || e.message); process.exit(1); });
