import { Module } from '@nestjs/common';
import { GerenteModule } from './gerente/gerente.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [GerenteModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
