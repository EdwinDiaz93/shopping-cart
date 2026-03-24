import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SearchRolDto } from './dto';
import { PrismaService } from 'src/shared/services';
import { ValidRoles } from 'src/auth/interfaces';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createRoleDto: CreateRoleDto) {
    try {
      const rol = await this.prismaService.rol.create({
        data: {
          name: createRoleDto.name,
        },
      });
      return rol;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async findAll(searchRolDto: SearchRolDto) {
    try {
      const roles = await this.prismaService.rol.findMany({
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
      return roles.map((rol) => ({
        ...rol,
        permissions: rol.permissions.map((per) => ({
          ...per.permission,
        })),
      }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async findOne(id: number) {
    try {
      const rol = await this.prismaService.rol.findUnique({ where: { id } });
      return rol;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      await this.findOne(id);
      this.prismaService.rol.update({
        where: { id },
        data: {
          name: updateRoleDto.name,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }

  async remove(id: number) {
    try {
      const rol = await this.findOne(id);
      if (rol?.name === ValidRoles.Admin || rol?.name === ValidRoles.User)
        throw new BadRequestException(`Cannot delete ${rol.name}`);
      await this.prismaService.rol.delete({ where: { id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }
}
