import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        PassportModule,
        UsersModule,
        JwtModule.registerAsync({
            useFactory: () => ({
                privateKey: (process.env.PRIVATE_KEY ?? (() => { throw new Error('PRIVATE_KEY is not defined'); })()).replace(/\\n/g, '\n'),
                publicKey: (process.env.PUBLIC_KEY ?? (() => { throw new Error('PUBLIC KEY is not defined'); })()).replace(/\\n/g, '\n'),
                signOptions: {
                    algorithm: 'RS256',
                }
            }),
        }),
        EmailModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtStrategy]
})
export class AuthModule {}
