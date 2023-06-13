import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { CreateUserDTO, UploadUserImageDTO } from './dto/create-user.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { updateUserDTO } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post('/register')
  async registerUser(@Body() createUserDto: CreateUserDTO) {
    createUserDto.email = createUserDto.email.toLowerCase();
    return await this.userService.registerUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUser(@Req() req: any): Promise<User> {
    const { userId } = req.user;
    return await this.userService.getUserById(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/change-password')
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDTO
  ): Promise<any> {
    const { userId } = req.user;
    await this.userService.changePassword(userId, changePasswordDto);
    return { message: 'Password updated successfully.' }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/update')
  async updateUser(
    @Req() req: any,
    @Body() updateUserDto: updateUserDTO
  ): Promise<any> {
    const { userId } = req.user;
    await this.userService.updateUser(userId, updateUserDto);
    return { message: 'User updated successfully.' }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File = null
  ): Promise<any> {
    const { userId } = req.user;
    const user = await this.userService.getUserById(userId);

    if (user.profileImage) {
      const publicId = user.profileImage.cloudinaryPublicId
      await this.cloudinaryService.deleteImage(publicId)
    }

    const { secure_url, public_id } = await this.cloudinaryService.uploadImage(file);

    const uploadUserImageDto: UploadUserImageDTO = {
      imageUrl: secure_url,
      cloudinaryPublicId: public_id
    }

    await this.userService.uploadUserImage(userId, uploadUserImageDto)

    return { message: 'Profile image uploaded successfully.' }
  }
  
}