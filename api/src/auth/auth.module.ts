import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'src/email/email.module';
import { UsersModule } from 'src/users/users.module';
import { CsrfModule } from 'src/security/csrf/csrf.module';
import { UsersService } from 'src/users/users.service';


@Module({
    imports: [
        UsersModule,
        EmailModule,
        CsrfModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
