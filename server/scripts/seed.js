import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const ownerEmail = 'owner@example.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Administrator Account',
      email: adminEmail,
      address: 'HQ, Admin Street, Metropolis',
      passwordHash: await bcrypt.hash('Admin@1234', 10),
      role: 'ADMIN'
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      name: 'Primary Store Owner Name',
      email: ownerEmail,
      address: 'Owner Address, City',
      passwordHash: await bcrypt.hash('Owner@1234', 10),
      role: 'OWNER'
    }
  });

  const store = await prisma.store.upsert({
    where: { email: 'store@example.com' },
    update: {},
    create: {
      name: 'Sample Store',
      email: 'store@example.com',
      address: '123 Market Road, City',
      ownerId: owner.id
    }
  });

  console.log({ admin, owner, store });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
