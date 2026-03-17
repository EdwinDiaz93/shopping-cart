import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RequestHeaders = createParamDecorator(
  (_: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const requestHeaders = request.headers;

    if (!requestHeaders['refresh_token']) {
      throw new BadRequestException('Invalid Session');
    }
    return requestHeaders;
  },
);
