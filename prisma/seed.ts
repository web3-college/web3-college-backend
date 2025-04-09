import { PrismaClient } from './client/postgresql';
import { permissionSeeds } from '../src/permission/seed/permission.seed';
import { roleSeeds } from '../src/role/seed/role.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  // 导入权限
  console.log('开始导入权限数据...');
  const existingPermissions = await prisma.permission.findMany({
    select: { name: true },
  });
  const existingPermissionNames = existingPermissions.map(p => p.name);

  const newPermissions = permissionSeeds.filter(
    p => !existingPermissionNames.includes(p.name)
  );

  if (newPermissions.length > 0) {
    await prisma.permission.createMany({
      data: newPermissions,
      skipDuplicates: true,
    });
    console.log(`成功导入 ${newPermissions.length} 条权限数据`);
  } else {
    console.log('没有新权限需要导入');
  }

  // 导入角色
  console.log('开始导入角色数据...');
  const existingRoles = await prisma.role.findMany({
    select: { name: true },
  });
  const existingRoleNames = existingRoles.map(r => r.name);

  // 获取所有权限，用于建立角色-权限关系
  const permissions = await prisma.permission.findMany();
  const permissionMap = permissions.reduce((map, permission) => {
    map[permission.name] = permission.id;
    return map;
  }, {});

  // 过滤出不存在的角色
  const newRoles = roleSeeds.filter(r => !existingRoleNames.includes(r.name));

  if (newRoles.length > 0) {
    // 创建角色及其权限关联
    for (const roleSeed of newRoles) {
      await prisma.$transaction(async (tx) => {
        // 创建角色
        const role = await tx.role.create({
          data: {
            name: roleSeed.name,
            description: roleSeed.description,
          },
        });

        // 关联权限
        if (roleSeed.permissions && roleSeed.permissions.length > 0) {
          const rolePermissions = roleSeed.permissions
            .filter(permName => permissionMap[permName]) // 过滤掉不存在的权限
            .map(permName => ({
              roleId: role.id,
              permissionId: permissionMap[permName],
            }));

          if (rolePermissions.length > 0) {
            await tx.rolePermissions.createMany({
              data: rolePermissions,
              skipDuplicates: true,
            });
          }
        }
      });
    }
    console.log(`成功导入 ${newRoles.length} 个角色`);
  } else {
    console.log('没有新角色需要导入');
  }

  console.log('数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 