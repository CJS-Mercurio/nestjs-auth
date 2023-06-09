import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { MailerModule } from '@nestjs-modules/mailer';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';

dotenv.config({ path: `.env${'.' + process.env?.NODE_ENV}` });

@Module({
  imports: [
      MongooseModule.forRoot(process.env.MONGO_URI),
      MailerModule.forRoot({
        transport: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: false,
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        },
      }),
      AuthModule,
      UserModule,
      CloudinaryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
