import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { AssignPermissionDto, AssignRolDto } from './dto';
import { ValidPermissions } from 'src/auth/interfaces';
import { Permission } from 'src/auth/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('assign-roles')
  @Permission(ValidPermissions.rolesAssign)
  assignRol(@Body() assignRolDto: AssignRolDto) {
    return this.usersService.assignRol(assignRolDto);
  }

  @Post('assign-permissions')
  @Permission(ValidPermissions.permissionAssign)
  assignPermissions(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.usersService.assignPermission(assignPermissionDto);
  }
}
