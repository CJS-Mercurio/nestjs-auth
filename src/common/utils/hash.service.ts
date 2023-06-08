import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class HashService {

  async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePassword(password: string, hash) {
    return await bcrypt.compare(password, hash)
  }

  async generatePasswordToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
}