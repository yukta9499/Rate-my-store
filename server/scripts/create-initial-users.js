// server/scripts/create-initial-users.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const ownerEmail = 'owner@example.com';

  const adminPassword = 'AdminPassword123!';   // badal dein production mein
  const ownerPassword = 'OwnerPassword123!';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const ownerHash = await bcrypt.hash(ownerPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Administrator',
      email: adminEmail,
      address: 'Headquarters',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      name: 'Store Owner',
      email: ownerEmail,
      address: 'Owner Address',
      passwordHash: ownerHash,
      role: 'OWNER'
    }
  });

  console.log('Created/Updated:', { admin: admin.email, owner: owner.email });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
