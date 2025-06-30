import { Module } from '@nestjs/common';
import { GerenteModule } from './users/gerente/gerente.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { SecurityJwtModule } from './security/jwt/jwt.module';
import { AppService } from './app.service';

@Module({
  imports: [SecurityJwtModule, GerenteModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
