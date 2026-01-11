import { Global, Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { BcryptService } from './services/bcrypt.service';

@Global()
@Module({
  providers: [PasswordService, BcryptService],
  exports: [PasswordService, BcryptService],
})
export class CommonModule {}

