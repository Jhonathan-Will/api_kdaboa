import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { GerenteModule } from 'src/gerente/gerente.module';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [GerenteModule, JwtModule.register({secret: process.env.SECRET, signOptions: {expiresIn: '60s'}}), EmailModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
