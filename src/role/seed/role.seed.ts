/**
 * 角色种子数据
 */
export const roleSeeds = [
  {
    name: 'super',
    description: '超级管理员',
    permissions: ['permission:read', 'permission:create', 'permission:update', 'permission:delete',
      'role:read', 'role:create', 'role:update', 'role:delete',
      'user:read', 'user:create', 'user:update', 'user:delete',
      'course:read', 'course:create', 'course:update', 'course:delete']
  },
  {
    name: 'admin',
    description: '系统管理员',
    permissions: ['permission:read', 'permission:create', 'permission:update', 'permission:delete',
      'role:read', 'role:create', 'role:update', 'role:delete',
      'user:read', 'user:create', 'user:update', 'user:delete',
      'course:read', 'course:create', 'course:update', 'course:delete']
  },
  {
    name: 'user',
    description: '用户',
    permissions: ['user:update', 'course:read']
  },
]; 