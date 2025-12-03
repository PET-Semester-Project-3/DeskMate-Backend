import dotenv from 'dotenv';
import { prisma } from '../src/db/prisma';
import { createUser, createDesk, createPermission, createUserToDesk, createUserToPermission, createController, createScheduledTask } from './creationMethods'
import { JsonNullValueInput } from '../src/generated/prisma/internal/prismaNamespace';
import { ScheduledTaskStatus } from '../src/generated/prisma/enums';

// Load environment variables
dotenv.config();


async function main() {

  const isClear = false;

  const isCreateUsers = true;
  const isCreateControllers = true;
  const isCreateDesks = true;
  const isCreatePermissions = true;
  const isCreateScheduledTask = true;
  const isCreateUserToDeskRelations = true;
  const isCreateUserToPermissionsRelations = true;

  console.log('Start seeding...');

  // Clear existing data
  if (isClear) {
    console.log('Clearing existing data...');
    await prisma.userPermission.deleteMany();
    await prisma.userDesk.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.desk.deleteMany();
    await prisma.user.deleteMany();
    console.log('Existing data cleared.');
  }

  // Create demo controllers
  if (isCreateControllers) {
    console.log('Creating demo controllers...');
    const controller1 = await createController('8bdd51ed-2e55-4b96-9982-2d5265403d3c', 'Controller 1');
    const controller2 = await createController('1639f8fa-44c0-434f-be0b-b4f752be634d', 'Controller 2');
    console.log('Created controllers:', { controller1, controller2 });
  }

  // Create demo users
  if (isCreateUsers) {
    console.log('Creating demo users...');
    const user1 = await createUser(
      'd93419b8-7f82-4a1f-943d-6ad9bde6d993', 'admin@deskmate.com', 
      '$2b$10$5zfBSBc97ff2qckEem0R.uUq/fGoAqgfAaAXF87W02tqHAKzGBzW6', 
      '1',
      new Date('2025-11-18T12:29:31.571Z'), new Date('2025-11-18T12:29:31.571Z'),
    );
    const user2 = await createUser(
      'd812baf1-1d50-4c83-ad2e-d65dd1d0dce2', 'user@deskmate.com', 
      '$2b$10$W/hrlbdK8DpN4u2XRby0ZuJPyfWYgsCrMKZsivNeQwCinaAxJjFEq',
      '2',
      new Date('2025-11-18T12:31:36.661Z'), new Date('2025-11-18T12:31:36.661Z'),
    );
    const user3 = await createUser(
      'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', 'manager@deskmate.com', 
      '$2b$10$LWGF3.GA331XYglBX0ujQet3pixqc8UCr2N5ZeriSijlEtOdaoGL.',
      '3',
      new Date('2025-12-03T20:13:23.828Z'), new Date('2025-12-03T20:19:31.675Z'),
    );
    console.log('Created users:', { user1, user2, user3 });
  }
  
  // Create demo desks
  if (isCreateDesks) {
    console.log('Creating demo desks...');
    const desk1 = await createDesk('1', '8bdd51ed-2e55-4b96-9982-2d5265403d3c', 'DCD1', false, true,
      JSON.parse("{\"manufacturer\":\"Linak\", \"height\":75,\"errors\":[\"Pressure Sensor\",\"Connection Issue\"],\"activationCounter\":42,\"sitStandCounter\":11}"),
      new Date('2025-11-14T18:11'), new Date('2025-11-14T18:00'), new Date('2025-11-14T18:11')
    )
    const desk2 = await createDesk('2', '1639f8fa-44c0-434f-be0b-b4f752be634d', 'DCD2', false, true,
      JSON.parse("{\"manufacturer\":\"Linak\", \"height\":75,\"activationCounter\":16,\"sitStandCounter\":5}"),
      new Date('2025-11-11T13:10'), new Date('2025-11-14T13:00'), new Date('2025-11-14T13:10')
    )
    const desk3 = await createDesk('3', null, 'DCD3', true, false,
      JSON.parse("{\"manufacturer\":\"Linak\", \"height\":75,\"activationCounter\":12,\"sitStandCounter\":2}"),
      new Date('2025-11-04T13:10'), new Date('2025-11-04T13:00'), new Date('2025-11-04T04:10')
    )
    const desk4 = await createDesk('4', null, 'DCD4', false, false,
      JSON.parse("{\"manufacturer\":\"Linak\", \"height\":75,\"errors\":[\"Pressure Sensor\"],\"activationCounter\":24,\"sitStandCounter\":6}"),
      new Date('2025-10-04T13:10'), new Date('2025-10-04T13:00'), new Date('2025-10-04T04:10')
    )
    const desk5 = await createDesk('5', null, 'DCD5', false, true,
      JSON.parse("{\"manufacturer\":\"Linak\", \"height\":75,\"activationCounter\":64,\"sitStandCounter\":1}"),
      new Date('2025-10-07T13:10'), new Date('2025-10-07T13:00'), new Date('2025-10-07T04:10')
    )
    console.log('Created desks:', { desk1, desk2, desk3, desk4, desk5 });
  }

  // Create demo permissions
  if (isCreatePermissions) {
    console.log('Creating demo permissions...');
    const permission1 = await createPermission('ba643e58-0e52-4a8f-baf4-329de946ec76', 'Dashboard', '/', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const permission2 = await createPermission('140898c7-2e9c-471d-88eb-7b1b277cb880','Desk', '/desk', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const permission3 = await createPermission('ec95035b-99f2-4752-9911-c93387ff6cd9','Maintenance', '/maintenance', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const permission4 = await createPermission('70fd3ff3-f37f-413a-b852-04fdf1e27b67','Database', '/database', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    console.log('Created permissions:', { permission1, permission2, permission3, permission4 });
  }

  // Create demo scheduled tasks
  if (isCreateScheduledTask) {
    console.log('Creating demo scheduled tasks...');
    const scheduledTask1 = await createScheduledTask(
      'd8c476ad-f436-4f15-81fc-6297879ac17b', 
      '1',
      'd812baf1-1d50-4c83-ad2e-d65dd1d0dce2',
      'Morning Routine',
      110,
      new Date('2025-11-13T08:00'),
      new Date('2025-11-14T09:00'),
      new Date('2025-11-14T09:00'),
      new Date('2025-11-14T12:00'),
      ScheduledTaskStatus.IN_PROGRESS,
      ''
    );
    const scheduledTask2 = await createScheduledTask(
      'f5209a0c-9cbe-44e6-a745-d651f8cef7d7',
      '2',
      'd93419b8-7f82-4a1f-943d-6ad9bde6d993',
      'Evening Routine',
      140,
      new Date('2025-11-13T08:00'),
      new Date('2025-11-14T09:00'),
      new Date('2025-11-14T15:00'),
      new Date('2025-11-14T18:00'),
      ScheduledTaskStatus.IN_PROGRESS,
      ''
    );
    console.log('Created scheduled tasks:', { scheduledTask1, scheduledTask2 });
  }

  // Create demo UserToDesk relations
  if (isCreateUserToDeskRelations) {
    console.log('Creating demo UserToDesk relations...');
    const userToDeskRelation1 = await createUserToDesk('29e44bf3-d004-4cd8-8280-97fcb5729405', 'd812baf1-1d50-4c83-ad2e-d65dd1d0dce2', '1', new Date('2025-11-14T18:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation2 = await createUserToDesk('6f676b4a-58af-4880-94ed-854cfa503932', 'd812baf1-1d50-4c83-ad2e-d65dd1d0dce2', '2', new Date('2025-11-14T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation3 = await createUserToDesk('1bedcc7d-c491-4fc5-9881-b77c9af52186', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', '1', new Date('2025-11-14T18:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation4 = await createUserToDesk('8ceac26e-b555-458c-b674-d55748035a73', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', '2', new Date('2025-11-14T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation5 = await createUserToDesk('7171259a-f910-4f9c-a10e-63c451832fc0', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', '3', new Date('2025-11-04T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation6 = await createUserToDesk('8f5ef122-5aed-462b-929d-ce0981fc182b', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', '4', new Date('2025-10-04T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation7 = await createUserToDesk('673ef5a0-83ea-43a9-bf80-933568f2e37a', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', '5', new Date('2025-10-07T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation8 = await createUserToDesk('bc68ffcb-eb8e-4d54-9bcb-428c98c71577', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', '1', new Date('2025-11-14T18:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation9 = await createUserToDesk('210d4b43-9424-4079-b2e5-631c5e6661cd', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', '2', new Date('2025-11-14T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation10 = await createUserToDesk('f58685ca-5e16-4a67-b026-57202599b03c', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', '3', new Date('2025-11-04T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation11 = await createUserToDesk('a113900c-6503-4612-9510-6c77c55a6110', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', '4', new Date('2025-10-04T13:00'), new Date('2025-01-01T09:00'));
    const userToDeskRelation12 = await createUserToDesk('942b8faa-50ce-4402-8afa-33b8ffb247f0', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', '5', new Date('2025-10-07T13:00'), new Date('2025-01-01T09:00'));
    console.log('Created UserToDesk relations:', { userToDeskRelation1, userToDeskRelation2, userToDeskRelation3, userToDeskRelation4, userToDeskRelation5, userToDeskRelation6, userToDeskRelation7, userToDeskRelation8, userToDeskRelation9, userToDeskRelation10, userToDeskRelation11, userToDeskRelation12 });
  }

  // Create demo UserToPermission relations
  if (isCreateUserToPermissionsRelations) {
    console.log('Creating demo UserToPermission relations...');
    const userToPermissionRelation1 = await createUserToPermission('bb8f33af-267e-4db8-9e58-0985c7f7e463', 'd812baf1-1d50-4c83-ad2e-d65dd1d0dce2', 'ba643e58-0e52-4a8f-baf4-329de946ec76', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation2 = await createUserToPermission('e4926f23-54a8-4a11-b6c1-3dae99826e6b', 'd812baf1-1d50-4c83-ad2e-d65dd1d0dce2', '140898c7-2e9c-471d-88eb-7b1b277cb880', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation3 = await createUserToPermission('efd9b47d-7525-4ddd-961f-f4d0903afcd9', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', 'ba643e58-0e52-4a8f-baf4-329de946ec76', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation4 = await createUserToPermission('30079cc0-2101-481f-97a0-b15b1595f535', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', '140898c7-2e9c-471d-88eb-7b1b277cb880', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation5 = await createUserToPermission('89fd0b2f-694b-4cff-9fdb-e23ca2bbf6c6', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', 'ec95035b-99f2-4752-9911-c93387ff6cd9', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation6 = await createUserToPermission('4e871e92-4315-45be-b298-91d5a6b3f9b6', 'd93419b8-7f82-4a1f-943d-6ad9bde6d993', '70fd3ff3-f37f-413a-b852-04fdf1e27b67', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation7 = await createUserToPermission('949a4b67-a29a-42bb-8a9f-f9582f3fdda9', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', 'ba643e58-0e52-4a8f-baf4-329de946ec76', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation8 = await createUserToPermission('b2006760-9254-41d5-b87a-b9459b1c0654', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', '140898c7-2e9c-471d-88eb-7b1b277cb880', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    const userToPermissionRelation9 = await createUserToPermission('4416141b-a319-4f99-bad6-857388af34ec', 'bd3e28a8-1582-42b0-892d-b70dfec0b4a5', 'ec95035b-99f2-4752-9911-c93387ff6cd9', new Date('2025-01-01T09:00'), new Date('2025-01-01T09:00'));
    console.log('Created UserToPermission relations:', { userToPermissionRelation1, userToPermissionRelation2, userToPermissionRelation3, userToPermissionRelation4, userToPermissionRelation5, userToPermissionRelation6, userToPermissionRelation7, userToPermissionRelation8, userToPermissionRelation9 });
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
