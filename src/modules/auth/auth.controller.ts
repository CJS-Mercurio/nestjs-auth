import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.sendPasswordResetEmail(email);
    return { message: 'Password reset email sent successfully.' };
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password reset successfully.' };
  }

}
