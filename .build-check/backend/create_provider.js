const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createProvider() {
  const password = await bcrypt.hash('0000', 10);
  await prisma.provider.upsert({
    where: { email: 'provider@test.com' },
    update: { status: 'VALIDATED' },
    create: {
      firstName: 'Test',
      lastName: 'Provider',
      email: 'provider@test.com',
      password,
      phone: '0555555555',
      address: 'Test Address',
      documentUrl: 'test.pdf',
      status: 'VALIDATED'
    }
  });
  console.log('Provider created');
}

createProvider().finally(() => prisma.$disconnect());
