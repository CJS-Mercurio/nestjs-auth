import { Module } from '@nestjs/common';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HashService } from 'src/common/utils/hash.service';
import { jwtConstants } from 'src/common/constant/constants';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/services/auth.service';
import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import { LocalStrategy } from 'src/common/strategy/local.strategy';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {
                expiresIn: '60d'
            }
        }),
        CloudinaryModule
    ],
    controllers: [UserController],
    providers: [UserService, HashService, AuthService, JwtStrategy, LocalStrategy],
})
export class UserModule {}
