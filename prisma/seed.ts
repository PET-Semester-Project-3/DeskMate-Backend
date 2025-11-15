import dotenv from 'dotenv';
import { prisma } from '../src/db/prisma';
import { createUser, createDesk, createPermission, createUserToDesk, createUserToPermission } from './creationMethods'
import { JsonNullValueInput } from '../src/generated/prisma/internal/prismaNamespace';

// Load environment variables
dotenv.config();


async function main() {

  const isCreateUsers = true;
  const isCreateDesks = true;
  const isCreatePermissions = true;
  //const isCreateControllers = true;
  // const isCreateScheduledTask = true;
  const isCreateUserToDeskRelations = true;
  const isCreateUserToPermissionsRelations = true;

  console.log('Start seeding...');

  // Create demo users
  if (isCreateUsers) {
    console.log('Creating demo users...');
    const user1 = await createUser('1', 'admin@deskmate.com', 'password');
    const user2 = await createUser('2', 'user@deskmate.com', 'password');
    console.log('Created users:', { user1, user2 });
  }
  
  // Create demo desks
  if (isCreateDesks) {
    console.log('Creating demo desks...');
    const desk1 = await createDesk('1', null, 'DCD1', 'Linak', false, 
      JsonNullValueInput.JsonNull,
      new Date('2025-11-14T18:11'), new Date('2025-11-14T18:00'), new Date('2025-11-14T18:11')
    )
    const desk2 = await createDesk('2', null, 'DCD2', 'Linak', false, 
      JsonNullValueInput.JsonNull,
      new Date('2025-11-11T13:10'), new Date('2025-11-14T13:00'), new Date('2025-11-14T13:10')
    )
    const desk3 = await createDesk('3', null, 'DCD3', 'Linak', true, 
      JsonNullValueInput.JsonNull,
      new Date('2025-11-04T13:10'), new Date('2025-11-04T13:00'), new Date('2025-11-04T04:10')
    )
    const desk4 = await createDesk('4', null, 'DCD4', 'Linak', false, 
      JsonNullValueInput.JsonNull,
      new Date('2025-10-04T13:10'), new Date('2025-10-04T13:00'), new Date('2025-10-04T04:10')
    )
    const desk5 = await createDesk('5', null, 'DCD5', 'Linak', false, 
      JsonNullValueInput.JsonNull,
      new Date('2025-10-07T13:10'), new Date('2025-10-07T13:00'), new Date('2025-10-07T04:10')
    )
    console.log('Created desks:', { desk1, desk2, desk3, desk4, desk5 });
  }

  // Create demo permissions
  if (isCreatePermissions) {
    console.log('Creating demo permissions...');
    const permission1 = await createPermission('1', 'Dashboard', '/', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const permission2 = await createPermission('2','Desk', '/desk', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const permission3 = await createPermission('3','Maintenance', '/maintenance', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const permission4 = await createPermission('4','Database', '/database', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    console.log('Created permissions:', { permission1, permission2, permission3, permission4 });
  }

  // Create demo permissions
  /* if (isCreateControllers) {
    console.log('Creating demo controllers...');
    const permission1 = createPermission('1', 'Dashboard', '/', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    console.log('Created permissions:', { controller1 });
  } */

  // Create demo UserToDesk relations
  if (isCreateUserToDeskRelations) {
    console.log('Creating demo UserToDesk relations...');
    const userToDeskRelation1 = await createUserToDesk('1', '1', '1', new Date('2025-11-14T18:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation2 = await createUserToDesk('2', '1', '2', new Date('2025-11-14T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation3 = await createUserToDesk('3', '2', '1', new Date('2025-11-14T18:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation4 = await createUserToDesk('4', '2', '2', new Date('2025-11-14T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation5 = await createUserToDesk('5', '2', '3', new Date('2025-11-04T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation6 = await createUserToDesk('6', '2', '4', new Date('2025-10-04T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation7 = await createUserToDesk('7', '2', '5', new Date('2025-10-07T13:00'), new Date('2025-01-01T09:00'));
    console.log('Created UserToDesk relations:', { userToDeskRelation1, userToDeskRelation2, userToDeskRelation3, userToDeskRelation4, userToDeskRelation5, userToDeskRelation6, userToDeskRelation7 });
  }

  // Create demo UserToPermission relations
  if (isCreateUserToPermissionsRelations) {
    console.log('Creating demo UserToPermission relations...');
    const userToPermissionRelation1 = await createUserToPermission('1', '1', '1', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation2 = await createUserToPermission('2', '1', '2', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation3 = await createUserToPermission('3', '2', '1', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation4 = await createUserToPermission('4', '2', '2', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation5 = await createUserToPermission('5', '2', '3', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation6 = await createUserToPermission('6', '2', '4', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    console.log('Created UserToPermission relations:', { userToPermissionRelation1, userToPermissionRelation2, userToPermissionRelation3, userToPermissionRelation4, userToPermissionRelation5, userToPermissionRelation6 });
  }

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
