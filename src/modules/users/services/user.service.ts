import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import { CreateUserDTO } from "../dto/create-user.dto";
import { HashService } from "src/common/utils/hash.service";
import { ChangePasswordDTO } from "../dto/change-password.dto";

@Injectable()
export class UserService {
  constructor (
    @InjectModel(User.name) 
    private readonly userModel: Model<UserDocument>,
    private readonly hashService: HashService
  ) {}

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async registerUser(createUserDto: CreateUserDTO) {
    const createdUser = new this.userModel(createUserDto);
    const user = await this.getUserByEmail(createdUser.email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    createdUser.password = await this.hashService.hashPassword(createUserDto.password);
    createdUser.save();

    return createdUser;
  }

  async getUserByResetToken(token: string) {
    return this.userModel.findOne({ resetPasswordToken: token }).exec();
  }

  async updatePassword(userId: string, newPassword: string) {
    await this.userModel.updateOne({ _id: userId }, { password: newPassword });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDTO
  ): Promise<any> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    const isOldPasswordValid = await this.hashService.comparePassword(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password.');
    }

    if (newPassword === oldPassword) {
      throw new BadRequestException('New password must be different from the old password.');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation password must match.');
    }

    const newHashedPassword = await this.hashService.hashPassword(newPassword);
    user.password = newHashedPassword;
    await user.save();

    return { message: 'Password changed successfully.' };
  }
  
}