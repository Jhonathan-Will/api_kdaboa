import { Module } from '@nestjs/common';
import { GerenteModule } from './gerente/gerente.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [GerenteModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
