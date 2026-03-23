import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS } from '../constants';
import { JwtPayload } from '../interfaces';
import { PrismaService } from 'src/shared/services';

@Injectable()
export class ValidatePermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly prismaService: PrismaService) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const permissions: string[] = this.reflector.get(
      PERMISSIONS,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();

    const user: JwtPayload = request.user;

    const rol = await this.prismaService.userRol.findMany({ where: { userId: user.id }, include: { rol: true } })
    
    const permissionsDB = await this.prismaService.rolPermission.findMany({ where: { rolId: { in: rol.map(rol => rol.rolId) } }, include: { permission: true } })

    if (
      permissions.length === 0 ||
      permissions.some((permission) =>
        permissionsDB.some(
          (userPermission) => userPermission.permission.name === permission,
        ),
      )
    ) {
      return true;
    }

    return false;
  }
}
