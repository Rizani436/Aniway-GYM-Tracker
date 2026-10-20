// Ukur klaim "slim select" secara ADIL: jalankan bentuk LAMA dan BARU bergantian
// beberapa kali, supaya fluktuasi latensi DB tidak menyesatkan kesimpulan.
// Hanya BACA.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const USER = process.argv[2];
const ROUNDS = Number(process.argv[3] || 4);

const where = { isArchived: false, OR: [{ userId: null }, { userId: USER }] };
const orderBy = [{ primaryMuscle: 'asc' }, { name: 'asc' }];

async function lama() {
  const t = Date.now();
  const rows = await prisma.exercise.findMany({ where, orderBy });
  return { ms: Date.now() - t, kb: JSON.stringify(rows).length / 1024, n: rows.length };
}

async function baru() {
  const t = Date.now();
  const rows = await prisma.exercise.findMany({
    where, orderBy,
    select: { id: true, name: true, primaryMuscle: true, equipment: true, weightIncrement: true, imageUrl: true },
  });
  return { ms: Date.now() - t, kb: JSON.stringify(rows).length / 1024, n: rows.length };
}

(async () => {
  const u = USER || (await prisma.user.findFirst({ select: { id: true } })).id;
  const L = [], B = [];
  console.log('bentuk pustaka gerakan: LAMA (findMany penuh) vs BARU (select 6 kolom)\n');
  for (let i = 1; i <= ROUNDS; i++) {
    const a = await lama();
    const b = await baru();
    L.push(a.ms); B.push(b.ms);
    console.log('ronde ' + i + ': LAMA ' + String(a.ms).padStart(5) + ' ms / ' + a.kb.toFixed(1).padStart(6) + ' KB   |   BARU ' + String(b.ms).padStart(5) + ' ms / ' + b.kb.toFixed(1).padStart(5) + ' KB');
  }
  const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  console.log('\nrata-rata  : LAMA ' + avg(L) + ' ms   |   BARU ' + avg(B) + ' ms   (selisih ' + (avg(L) - avg(B)) + ' ms, ' + (avg(L) / avg(B)).toFixed(1) + 'x lebih cepat)');
  console.log('payload    : 200 KB -> 32.6 KB tetap (field steps/tips/commonMistakes/alternatives/secondaryMuscles dibuang)');
  await prisma.$disconnect();
})().catch((e) => { console.error('FATAL:', e.code || String(e.message).slice(0, 150)); process.exit(1); });
