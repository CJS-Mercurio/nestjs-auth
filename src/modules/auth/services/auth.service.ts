import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/utils/hash.service';
import { UserService } from 'src/modules/users/services/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);

    if ( user && (await this.hashService.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const resetToken = await this.hashService.generatePasswordToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    user.save();

    const emailTemplate = fs.readFileSync('src/common/templates/password-reset.html', 'utf-8');
    const template = handlebars.compile(emailTemplate);

    const resetLink = process.env.RESET_ROUTE + '/' + resetToken;

    const templateData = {
      resetUrl: resetLink
    }

    const emailContent = template(templateData);

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: emailContent
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDTO) {
    const { resetToken, newPassword, confirmPassword } = resetPasswordDto;
    const user = await this.userService.getUserByResetToken(resetToken);

    if (!user) {
      throw new NotFoundException('Invalid or Expired Token.');
    }

    if (user.resetPasswordExpires < Date.now()) {
      throw new BadRequestException('Token has expired.');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation password must match.');
    }

    const newHashedPassword = await this.hashService.hashPassword(newPassword);
    user.password = newHashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return user;
  }
}
