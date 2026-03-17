import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  // connectionString: process.env.DATABASE_URL,
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
});

const adapter = new PrismaPg(pool);

const prismaClient = new PrismaClient({ adapter });

async function main() {
  const permissions = [
    { name: 'users.create' },
    { name: 'users.read' },
    { name: 'users.delete' },
    { name: 'users.update' },
    { name: 'roles.create' },
    { name: 'roles.read' },
    { name: 'roles.delete' },
    { name: 'roles.update' },
    { name: 'roles.assign' },
    { name: 'permissions.assign' },
  ];
  const permissionsPromises = permissions.map((permission) =>
    prismaClient.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
      select: { id: true, name: true },
    }),
  );

  const permissionsDb = await Promise.all(permissionsPromises);

  const adminRole = await prismaClient.rol.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  const userRole = await prismaClient.rol.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User' },
  });

  const adminRolPermissionPromises = permissionsDb.map((permission) =>
    prismaClient.rolPermission.upsert({
      where: {
        rolId_permissionId: {
          permissionId: permission.id,
          rolId: adminRole.id,
        },
      },
      update: {},
      create: {
        permissionId: permission.id,
        rolId: adminRole.id,
      },
    }),
  );
  await Promise.all(adminRolPermissionPromises);

  const userRolPermissionPromises = permissionsDb
    .filter(
      (permission) =>
        permission.name === 'users.update' || permission.name === 'users.read',
    )
    .map((permission) =>
      prismaClient.rolPermission.upsert({
        where: {
          rolId_permissionId: {
            permissionId: permission.id,
            rolId: userRole.id,
          },
        },
        update: {},
        create: {
          permissionId: permission.id,
          rolId: userRole.id,
        },
      }),
    );
  await Promise.all(userRolPermissionPromises);
  
  const adminUser = await prismaClient.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'admin',
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin', bcrypt.genSaltSync(10)),
    },
  });

  await prismaClient.userRol.upsert({
    where: {
      rolId_userId: {
        rolId: adminRole.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      rolId: adminRole.id,
      userId: adminUser.id,
    },
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prismaClient.$disconnect();
  });
