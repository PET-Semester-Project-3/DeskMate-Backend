import { prisma } from '../src/db/prisma';
import { ScheduledTaskStatus } from '../src/generated/prisma/enums';
import { JsonNullValueInput } from '../src/generated/prisma/internal/prismaNamespace';

//#region Create Objects

export async function createUser(id:string, email: string, password_hash: string) {
  const user = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      id,
      email,
      password_hash,
    },
  });
  return user;
}

export async function createDesk(
    id: string, controller_id:string | null , name:string,
    manufacturer:string, is_locked:boolean, last_data: JsonNullValueInput,
    last_data_at:Date, created_at:Date, updated_at:Date
) {
  const desk = await prisma.desk.upsert({
    where: { id: id },
    update: {},
    create: {
      id,
      controller_id,
      name,
      manufacturer,
      is_locked,
      last_data,
      last_data_at,
      created_at,
      updated_at
    },
  });
  return desk;
}

export async function createPermission(
    id:string, label: string, route:string,
    created_at:Date, updated_at:Date
) {
  const permission = await prisma.permission.upsert({
    where: { route: route },
    update: {},
    create: {
      id,
      label,
      route,
      created_at,
      updated_at,
    },
  });
  return permission;
}

export async function createController(id: string, name: string) {
  const controller = await prisma.controller.upsert({
    where: { id: id },
    update: {},
    create: {
      id,
      name,
    },
  });
  return controller;
}

export async function createScheduledTask(
    id: string, desk_id: string, user_id:string,
    description:string, new_height:number,
    created_at:Date, updated_at:Date, scheduled_at:Date, 
    completed_at:Date, status:ScheduledTaskStatus, error_message:string

) {
  const scheduledTask = await prisma.scheduledTask.upsert({
    where: { id: id },
    update: {},
    create: {
      id,
      desk_id,
      user_id,
      description,
      new_height,
      created_at,
      updated_at,
      scheduled_at,
      completed_at,
      status,
      error_message
    },
  });
  return scheduledTask;
}

//#endregion

//#region Create Relation Objects

export async function createUserToDesk(
    id: string, user_id: string, desk_id:string,
    created_at:Date, updated_at:Date
) {
  const userToDesk = await prisma.userDesk.upsert({
    where: { id: id },
    update: { },
    create: {
      id,
      user_id,
      desk_id,
      created_at,
      updated_at
    },
  });
  return userToDesk;
}

export async function createUserToPermission(
    id: string, user_id: string, permission_id:string,
    created_at:Date, updated_at:Date
) {
  const userToPermission = await prisma.userPermission.upsert({
    where: { id: id },
    update: {},
    create: {
      id,
      user_id,
      permission_id,
      created_at,
      updated_at,
    },
  });
  return userToPermission;
}

//#endregion