import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
for (let i = 0; i < 3; i++) {
  try {
    const [sessions, setLogs, prCount, warmup, dropset, failure, bwLogs, rpeFilled] = await Promise.all([
      p.workoutSession.count(),
      p.setLog.count(),
      p.setLog.count({ where: { isPersonalRecord: true } }),
      p.setLog.count({ where: { setType: 'WARMUP' } }),
      p.setLog.count({ where: { setType: 'DROPSET' } }),
      p.setLog.count({ where: { setType: 'FAILURE' } }),
      p.bodyWeightLog.count(),
      p.setLog.count({ where: { rpe: { not: null } } }),
    ]);
    const distinctEx = await p.setLog.groupBy({ by: ['exerciseId'], _count: true });
    console.log(JSON.stringify({ sessions, setLogs, prCount, warmup, dropset, failure, bwLogs, rpeFilled, distinctEx: distinctEx.length }));
    await p.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error(`attempt ${i+1} failed:`, e.message.slice(0, 120));
    await new Promise(r => setTimeout(r, 3000));
  }
}
process.exit(1);
