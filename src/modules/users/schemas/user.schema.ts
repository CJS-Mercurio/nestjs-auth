import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UploadUserImageDTO } from "../dto/create-user.dto";


export type UserDocument = HydratedDocument<User>

@Schema()
export class User {

  id?: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string

  @Prop({ required: false, type: UploadUserImageDTO })
  profileImage: UploadUserImageDTO;

  @Prop({ required: false })
  resetPasswordToken: string;

  @Prop({ required: false })
  resetPasswordExpires: number;

} 

export const UserSchema = SchemaFactory.createForClass(User);