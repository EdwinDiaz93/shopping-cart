import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from 'src/auth/decorators';
import { SearchRolDto } from './dto';
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permission(ValidPermissions.rolesCreate)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Post('search')
  @Permission(ValidPermissions.rolesRead)
  findAll(@Body() searchRolDto: SearchRolDto) {
    return this.rolesService.findAll(searchRolDto);
  }

  @Get(':id')
  @Permission(ValidPermissions.rolesRead)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @Permission(ValidPermissions.rolesUpdate)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Permission(ValidPermissions.rolesDelete)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
