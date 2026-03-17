import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS } from '../constants';
import { JwtPayload } from '../interfaces';

@Injectable()
export class ValidatePermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permissions: string[] = this.reflector.get(
      PERMISSIONS,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (
      permissions.length === 0 ||
      permissions.some((permission) =>
        user.permissions.some(
          (userPermission) => userPermission === permission,
        ),
      )
    ) {
      return true;
    }

    return false;
  }
}
