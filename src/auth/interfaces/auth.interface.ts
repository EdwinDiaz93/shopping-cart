export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  sessionId?: number;
  
}

export enum ValidPermissions {
  usersCreate = 'users.create',
  usersRead = 'users.read',
  usersDelete = 'users.delete',
  usersUpdate = 'users.update',
  rolesCreate = 'roles.create',
  rolesRead = 'roles.read',
  rolesDelete = 'roles.delete',
  rolesUpdate = 'roles.update',
  rolesAssign = 'roles.assign',
  permissionAssign = 'permissions.assign',
}

export enum ValidRoles {
  Admin = 'Admin',
  User = 'User',
}
