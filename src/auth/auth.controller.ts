import { Controller, Post, Body, Put, Get, Headers } from '@nestjs/common';

import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterhDto,
} from './dto';
import { Permission, RequestHeaders, User } from './decorators';
import { ValidPermissions, type JwtPayload } from './interfaces';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { type IncomingHttpHeaders } from 'http2';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Headers() headers: IncomingHttpHeaders, @Body() loginDto: LoginDto) {
    return this.authService.login(headers, loginDto);
  }
  @Post('register')
  register(
    @Headers() headers: IncomingHttpHeaders,
    @Body() registerDto: RegisterhDto,
  ) {
    return this.authService.register(headers, registerDto);
  }

  @Put('change-password')
  @Permission(ValidPermissions.usersUpdate)
  changePassword(
    @User() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordDto(resetPasswordDto);
  }

  @Get('profile')
  @Permission(ValidPermissions.usersRead)
  getProfileInfo(@User() user: JwtPayload) {
    return this.authService.getProfile(user);
  }

  @Get('refresh')
  refreshToken(@RequestHeaders() headers: IncomingHttpHeaders) {
    return this.authService.refreshToken(headers);
  }
}
