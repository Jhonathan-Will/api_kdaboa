import { Module } from '@nestjs/common';
import { GerenteModule } from './users/gerente/gerente.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { SecurityJwtModule } from './security/jwt/jwt.module';

@Module({
  imports: [SecurityJwtModule, GerenteModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
