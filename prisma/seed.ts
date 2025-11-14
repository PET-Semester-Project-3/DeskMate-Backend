import dotenv from 'dotenv';
import { prisma } from '../src/db/prisma';
import { createUser, createDesk } from './creationMethods'
import { JsonNullValueInput } from '../src/generated/prisma/internal/prismaNamespace';

// Load environment variables
dotenv.config();


async function main() {
  console.log('Start seeding...');

  // Create demo users
  const user1 = createUser('admin@deskmate.com', 'password');
  const user2 = createUser('user@deskmate.com', 'password');
  console.log('Created users:', { user1, user2 });

  // Create demo desks
  const desk1 = createDesk('1', '1', 'DCD1', 'Linak', false, 
    JsonNullValueInput.JsonNull,
    new Date('2025-11-14T18:11'), new Date('2025-11-14T18:00'), new Date('2025-11-14T18:11')
  )
  const desk2 = createDesk('2', '2', 'DCD2', 'Linak', false, 
    JsonNullValueInput.JsonNull,
    new Date('2025-11-11T13:10'), new Date('2025-11-14T13:00'), new Date('2025-11-14T13:10')
  )
  const desk3 = createDesk('3', '3', 'DCD3', 'Linak', false, 
    JsonNullValueInput.JsonNull,
    new Date('2025-11-04T13:10'), new Date('2025-11-04T13:00'), new Date('2025-11-04T04:10')
  )
  const desk4 = createDesk('4', '4', 'DCD4', 'Linak', false, 
    JsonNullValueInput.JsonNull,
    new Date('2025-10-04T13:10'), new Date('2025-10-04T13:00'), new Date('2025-10-04T04:10')
  )
  const desk5 = createDesk('5', '5', 'DCD5', 'Linak', false, 
    JsonNullValueInput.JsonNull,
    new Date('2025-10-07T13:10'), new Date('2025-10-07T13:00'), new Date('2025-10-07T04:10')
  )

  console.log('Created desks:', { desk1, desk2, desk3, desk4, desk5 });

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
