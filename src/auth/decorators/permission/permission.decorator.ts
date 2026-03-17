import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PERMISSIONS } from 'src/auth/constants';
import { ValidatePermissionGuard } from 'src/auth/guards';
import { ValidPermissions } from 'src/auth/interfaces';

export const Permission = (...permissions: ValidPermissions[]) => {
  return applyDecorators(
    SetMetadata(PERMISSIONS, permissions),
    UseGuards(AuthGuard(), ValidatePermissionGuard),
  );
};
