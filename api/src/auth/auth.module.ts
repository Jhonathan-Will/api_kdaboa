import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { GerenteModule } from 'src/gerente/gerente.module';

@Module({
    imports: [GerenteModule, JwtModule.register({secret: process.env.SECRET, signOptions: {expiresIn: '60s'}})],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
