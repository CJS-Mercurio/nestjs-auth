import { Body, Controller, Get, Post, Query, UseGuards, Request } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { ChangePasswordDTO } from "./dto/change-password.dto"
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "../auth/services/auth.service";

@Controller('user')
export class UserController {
  constructor (
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getUserByEmail(@Query('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }

  @Post('/register')
  async registerUser(@Body() createUserDto: CreateUserDTO ) {
    createUserDto.email = createUserDto.email.toLowerCase();
    
    return await this.userService.registerUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDTO
  ) {
    const { userId } = req.user;

    return this.userService.changePassword(userId, changePasswordDto);
  }
}