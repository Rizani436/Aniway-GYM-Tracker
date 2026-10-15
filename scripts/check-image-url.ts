import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
(async () => {
  const total = await p.exercise.count({ where: { userId: null } });
  const withImg = await p.exercise.count({
    where: { userId: null, imageUrl: { not: null } },
  });
  const noImg = await p.exercise.findMany({
    where: { userId: null, imageUrl: null },
    select: { name: true },
  });
  console.log(JSON.stringify({ total, withImg, noImg: noImg.map((x) => x.name) }));
  await p.$disconnect();
})();
