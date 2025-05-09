import { Module } from '@nestjs/common';
import { GerenteModule } from './gerente/gerente.module';


@Module({
  imports: [GerenteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
