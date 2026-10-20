// UJI PARITAS: apakah query gabungan (3 query untuk semua gerakan) menghasilkan
// historyMap yang IDENTIK dengan cara lama (4 query x per gerakan)?
//
// Kenapa wajib: kecepatan yang lebih tinggi tanpa hasil yang sama = regresi
// (prefill beban, chip "Rata", best 1RM, saran progressive overload, riwayat catatan).
// Hanya BACA.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- CARA LAMA (persis getExerciseHistoryForUser sebelum perubahan) ----------
async function caraLama(userId, exerciseId, targetRepMax, SetType) {
  const [lastSessionExercise, best1RMAgg, recentSessions, noteSessionExercises] = await Promise.all([
    prisma.sessionExercise.findFirst({
      where: { userId, exerciseId, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      include: { exercise: { select: { weightIncrement: true } }, sets: { orderBy: { setNumber: 'asc' } } },
    }),
    prisma.setLog.aggregate({ where: { userId, exerciseId, isCompleted: true }, _max: { estimated1RM: true } }),
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: 3,
      include: { sets: { where: { isCompleted: true, setType: { not: SetType.WARMUP } }, orderBy: { setNumber: 'asc' } } },
    }),
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId, notes: { not: null }, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: 5,
      select: { performedAt: true, notes: true },
    }),
  ]);

  const best1RM = best1RMAgg._max.estimated1RM || 0;
  if (!lastSessionExercise) {
    return { lastSessionDate: null, previousSets: [], best1RM, progressiveOverloadSuggestion: null, avgSets: [], noteHistory: [] };
  }

  const increment = lastSessionExercise.exercise?.weightIncrement || 2.5;
  const previousSets = lastSessionExercise.sets.map((s) => ({
    setNumber: s.setNumber, weight: s.weight, reps: s.reps, setType: s.setType, isCompleted: s.isCompleted,
  }));

  let progressiveOverloadSuggestion = null;
  if (targetRepMax && targetRepMax > 0 && previousSets.length > 0) {
    const completedWorkSets = previousSets.filter((s) => s.isCompleted && s.setType !== SetType.WARMUP);
    if (completedWorkSets.length > 0 && completedWorkSets.every((s) => s.reps >= targetRepMax)) {
      progressiveOverloadSuggestion = {
        suggestedWeightIncrement: increment,
        reason: `Semua ${completedWorkSets.length} set sesi lalu tembus target (${targetRepMax} rep). Naikkan beban +${increment} kg hari ini!`,
      };
    }
  }

  const avgSets = recentSessions.length
    ? Array.from({ length: Math.max(...recentSessions.map((se) => se.sets.length)) }, (_, i) => {
        const atPos = recentSessions.map((se) => se.sets[i]).filter((s) => !!s && s.reps > 0);
        if (!atPos.length) return null;
        return {
          weight: Math.round((atPos.reduce((a, s) => a + s.weight, 0) / atPos.length) * 10) / 10,
          reps: Math.round(atPos.reduce((a, s) => a + s.reps, 0) / atPos.length),
        };
      })
    : [];

  const noteHistory = noteSessionExercises
    .map((se) => ({ date: se.performedAt, notes: (se.notes || '').trim() }))
    .filter((n) => n.notes.length > 0)
    .slice(0, 5);

  return { lastSessionDate: lastSessionExercise.performedAt, previousSets, best1RM, progressiveOverloadSuggestion, avgSets, noteHistory };
}

// ---------- CARA BARU (replika logika baru di workout-actions.ts) ----------
async function caraBaru(userId, relevantIds, incrementMap, targetRepMaxMap, SetType) {
  const MAX_PRELOAD = 24;
  const [recentRows, bestRows, noteRows] = await Promise.all([
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId: { in: relevantIds }, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: MAX_PRELOAD * 4,
      select: {
        exerciseId: true, performedAt: true,
        sets: { orderBy: { setNumber: 'asc' }, select: { setNumber: true, weight: true, reps: true, setType: true, isCompleted: true } },
      },
    }),
    prisma.setLog.groupBy({ by: ['exerciseId'], where: { userId, exerciseId: { in: relevantIds }, isCompleted: true }, _max: { estimated1RM: true } }),
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId: { in: relevantIds }, notes: { not: null }, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: MAX_PRELOAD * 5,
      select: { exerciseId: true, performedAt: true, notes: true },
    }),
  ]);

  const bestMap = new Map(bestRows.map((r) => [r.exerciseId, r._max.estimated1RM || 0]));
  const rowsPerExercise = new Map();
  for (const row of recentRows) { const l = rowsPerExercise.get(row.exerciseId) ?? []; l.push(row); rowsPerExercise.set(row.exerciseId, l); }
  const notesPerExercise = new Map();
  for (const row of noteRows) { const l = notesPerExercise.get(row.exerciseId) ?? []; l.push(row); notesPerExercise.set(row.exerciseId, l); }

  const map = {};
  for (const exId of relevantIds) {
    const rows = (rowsPerExercise.get(exId) ?? []).slice(0, 3);
    const last = rows[0];
    const best1RM = bestMap.get(exId) ?? 0;
    const targetRepMax = targetRepMaxMap[exId];

    const noteHistory = (notesPerExercise.get(exId) ?? [])
      .map((r) => ({ date: r.performedAt, notes: (r.notes || '').trim() }))
      .filter((n) => n.notes.length > 0)
      .slice(0, 5);

    if (!last) {
      map[exId] = { lastSessionDate: null, previousSets: [], best1RM, progressiveOverloadSuggestion: null, avgSets: [], noteHistory };
      continue;
    }

    const previousSets = last.sets.map((s) => ({ setNumber: s.setNumber, weight: s.weight, reps: s.reps, setType: s.setType, isCompleted: s.isCompleted }));

    let progressiveOverloadSuggestion = null;
    if (targetRepMax && targetRepMax > 0 && previousSets.length > 0) {
      const workSets = previousSets.filter((s) => s.isCompleted && s.setType !== SetType.WARMUP);
      if (workSets.length > 0 && workSets.every((s) => s.reps >= targetRepMax)) {
        const inc = incrementMap[exId] ?? 2.5;
        progressiveOverloadSuggestion = {
          suggestedWeightIncrement: inc,
          reason: `Semua ${workSets.length} set sesi lalu tembus target (${targetRepMax} rep). Naikkan beban +${inc} kg hari ini!`,
        };
      }
    }

    const kerjaPerSesi = rows.map((r) => r.sets.filter((s) => s.isCompleted && s.setType !== SetType.WARMUP && s.reps > 0));
    const maxSetCount = kerjaPerSesi.length ? Math.max(...kerjaPerSesi.map((s) => s.length)) : 0;
    const avgSets = Array.from({ length: maxSetCount }, (_, i) => {
      const atPos = kerjaPerSesi.map((sets) => sets[i]).filter((s) => !!s);
      if (!atPos.length) return null;
      return {
        weight: Math.round((atPos.reduce((a, s) => a + s.weight, 0) / atPos.length) * 10) / 10,
        reps: Math.round(atPos.reduce((a, s) => a + s.reps, 0) / atPos.length),
      };
    });

    map[exId] = { lastSessionDate: last.performedAt, previousSets, best1RM, progressiveOverloadSuggestion, avgSets, noteHistory };
  }
  return map;
}

(async () => {
  const SetType = { NORMAL: 'NORMAL', WARMUP: 'WARMUP', DROP: 'DROP', FAILURE: 'FAILURE' };
  const user = await prisma.user.findFirst({ select: { id: true } });

  const progs = await prisma.program.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { sortOrder: 'asc' },
    include: { exercises: { include: { exercise: { select: { weightIncrement: true } } } } },
  });
  const prog = progs.find((p) => p.exercises.length >= 5) || progs[0];
  const ids = Array.from(new Set(prog.exercises.map((pe) => pe.exerciseId)));
  const incrementMap = Object.fromEntries(prog.exercises.map((pe) => [pe.exerciseId, pe.exercise?.weightIncrement || 2.5]));
  const targetRepMaxMap = Object.fromEntries(prog.exercises.map((pe) => [pe.exerciseId, pe.targetRepMax]));

  console.log('program uji : ' + prog.name + ' (' + ids.length + ' gerakan unik)\n');

  // CARA LAMA: satu per satu (kalau gagal, laporkan dan lanjut)
  const lama = {};
  let lamaGagal = 0;
  const t0 = Date.now();
  for (const id of ids) {
    try {
      lama[id] = await caraLama(user.id, id, targetRepMaxMap[id], SetType);
    } catch (e) {
      lamaGagal++;
      lama[id] = { ERROR: e.code || String(e.message).slice(0, 40) };
    }
  }
  console.log('cara LAMA  : ' + (Date.now() - t0) + ' ms, ' + ids.length * 4 + ' query, gagal=' + lamaGagal);

  const t1 = Date.now();
  const baru = await caraBaru(user.id, ids, incrementMap, targetRepMaxMap, SetType);
  console.log('cara BARU  : ' + (Date.now() - t1) + ' ms, 3 query, gagal=0\n');

  // BANDINGKAN per gerakan
  let sama = 0, beda = 0;
  const detail = [];
  for (const id of ids) {
    const a = lama[id], b = baru[id];
    if (a && a.ERROR) { detail.push('  ' + id.slice(0, 8) + '  cara lama GAGAL (' + a.ERROR + ') -> tak bisa dibandingkan'); continue; }
    const bidang = ['lastSessionDate', 'previousSets', 'best1RM', 'progressiveOverloadSuggestion', 'avgSets', 'noteHistory'];
    const bedaBidang = bidang.filter((k) => !equal(a[k], b[k]));
    if (bedaBidang.length === 0) { sama++; } else {
      beda++;
      detail.push('  ' + id.slice(0, 8) + '  BEDA di: ' + bedaBidang.join(', '));
      for (const k of bedaBidang) {
        detail.push('      lama : ' + JSON.stringify(a[k]).slice(0, 150));
        detail.push('      baru : ' + JSON.stringify(b[k]).slice(0, 150));
      }
    }
  }

  if (detail.length) { console.log('rincian:'); for (const d of detail) console.log(d); }
  console.log('\nhasil: ' + sama + ' gerakan IDENTIK, ' + beda + ' berbeda, ' + lamaGagal + ' tak terbandingkan (lama gagal)');
  console.log(beda === 0 ? '=> PARITAS TERBUKTI ✓' : '=> ADA PERBEDAAN — perlu diperiksa ✗');

  await prisma.$disconnect();
  process.exit(beda === 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL:', e.code || '', String(e.message).split('\n')[0].slice(0, 200)); process.exit(1); });
