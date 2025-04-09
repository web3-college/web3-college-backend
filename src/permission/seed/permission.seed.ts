/**
 * 权限种子数据
 */
export const permissionSeeds = [
  // 课程权限
  {
    name: 'course:create',
    action: 'create',
    description: '创建课程',
  },
  {
    name: 'course:read',
    action: 'read',
    description: '查看课程',
  },
  {
    name: 'course:update',
    action: 'update',
    description: '更新课程',
  },
  {
    name: 'course:delete',
    action: 'delete',
    description: '删除课程',
  },

  // 用户权限
  {
    name: 'user:create',
    action: 'create',
    description: '创建用户',
  },
  {
    name: 'user:read',
    action: 'read',
    description: '查看用户',
  },
  {
    name: 'user:update',
    action: 'update',
    description: '更新用户',
  },
  {
    name: 'user:delete',
    action: 'delete',
    description: '删除用户',
  },

  // 角色权限
  {
    name: 'role:create',
    action: 'create',
    description: '创建角色',
  },
  {
    name: 'role:read',
    action: 'read',
    description: '查看角色',
  },
  {
    name: 'role:update',
    action: 'update',
    description: '更新角色',
  },
  {
    name: 'role:delete',
    action: 'delete',
    description: '删除角色',
  },

  // 权限管理
  {
    name: 'permission:create',
    action: 'create',
    description: '创建权限',
  },
  {
    name: 'permission:read',
    action: 'read',
    description: '查看权限',
  },
  {
    name: 'permission:update',
    action: 'update',
    description: '更新权限',
  },
  {
    name: 'permission:delete',
    action: 'delete',
    description: '删除权限',
  },
]; 