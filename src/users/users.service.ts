import { HttpException, Injectable } from '@nestjs/common';
import { AssignPermissionDto, AssignRolDto } from './dto';
import { PrismaService } from 'src/shared/services';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async assignRol(assignRolDto: AssignRolDto) {
    try {
      const promises = assignRolDto.roleIds.map((rolId) =>
        this.prismaService.userRol.upsert({
          where: {
            rolId_userId: {
              rolId,
              userId: assignRolDto.userId,
            },
          },
          update: { rolId, userId: assignRolDto.userId },
          create: { rolId, userId: assignRolDto.userId },
        }),
      );
      await Promise.all(promises);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }
  async assignPermission(assignPermissionDto: AssignPermissionDto) {
    try {
      const promises = assignPermissionDto.permissionIds.map((permissionId) =>
        this.prismaService.userPermission.upsert({
          where: {
            userId_permissionId: {
              permissionId,
              userId: assignPermissionDto.userId,
            },
          },
          update: { permissionId, userId: assignPermissionDto.userId },
          create: { permissionId, userId: assignPermissionDto.userId },
        }),
      );
      await Promise.all(promises);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.prismaService.handleDbError(error);
    }
  }
}
