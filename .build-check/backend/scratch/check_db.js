const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = 'postgresql://postgres:0000@localhost:5432/immo_lamis?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const providers = await prisma.provider.findMany({
    select: { id: true, firstName: true, status: true }
  });
  console.log('--- PROVIDERS ---');
  console.table(providers);

  console.log('--- TESTING EXACT QUERY ---');
  const filtered = await prisma.listing.findMany({
    where: { 
      AND: [
        { status: 'PUBLISHED' },
        { provider: { status: 'VALIDATED' } }
      ]
    },
    include: { provider: { select: { firstName: true, status: true } } }
  });
  console.log('Results found:', filtered.length);
  console.table(filtered.map(l => ({
    id: l.id,
    title: l.title,
    provider: l.provider.firstName,
    pStatus: l.provider.status
  })));
  
  await prisma.$disconnect();
  await pool.end();
}

check().catch(console.error);
