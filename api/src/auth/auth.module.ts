import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'src/email/email.module';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { SecurityJwtModule } from 'src/security/jwt/jwt.module';
import { CsrfModule } from 'src/security/csrf/csrf.module';

@Module({
    imports: [
        PassportModule,
        UsersModule,
        SecurityJwtModule,
        EmailModule,
        CsrfModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
