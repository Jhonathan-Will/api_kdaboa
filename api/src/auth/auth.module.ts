import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { GerenteModule } from 'src/gerente/gerente.module';
import { EmailModule } from 'src/email/email.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        PassportModule,
        GerenteModule,
        JwtModule.register({
            secret: process.env.SECRET,
        }),
        EmailModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtStrategy]
})
export class AuthModule {}
