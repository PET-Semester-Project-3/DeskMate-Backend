import dotenv from 'dotenv';
import { prisma } from '../src/db/prisma';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Start seeding...');

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@deskmate.com' },
    update: {},
    create: {
      email: 'admin@deskmate.com',
      password_hash: 'password',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user@deskmate.com' },
    update: {},
    create: {
      email: 'user@deskmate.com',
      password_hash: 'password',
    },
  });

  console.log('Created users:', { user1, user2 });

  // Add more seed data here as needed
  // Example: controllers, desks, permissions, etc.

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
