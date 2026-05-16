const { PrismaService } = require('../src/prisma/prisma.service');

(async () => {
  const prisma = new PrismaService();
  try {
    const count = await prisma.passwordResetToken.count();
    console.log('count', count);
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
