import { prisma } from '../src/db/prisma';
import { JsonNullValueInput } from '../src/generated/prisma/internal/prismaNamespace';

export async function createUser(email: string, password_hash: string) {
  const user = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      email: email,
      password_hash: password_hash,
    },
  });
  return user;
}

export async function createDesk(
    id: string, controller_id: string, name:string,
    manufacturer:string, is_locked:boolean, last_data: JsonNullValueInput,
    last_data_at:Date, created_at:Date, updated_at:Date
) {
  const desk = await prisma.desk.upsert({
    where: { id: id },
    update: {},
    create: {
      id: id,
      controller_id: controller_id,
      name: name,
      manufacturer: manufacturer,
      is_locked: is_locked,
      last_data: last_data,
      last_data_at: last_data_at,
      created_at: created_at,
      updated_at: updated_at
    },
  });
  return desk;
}

