import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GerenteModule } from './users/gerente/gerente.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { SecurityJwtModule } from './security/jwt/jwt.module';
import { AppService } from './app.service';
import { FeatureModule } from './features/features.module';
import { FuncionarioModule } from './users/funcionario/funcionario.module';
import { NotificacaoModule } from './notification/notificacao.module';

@Module({
  imports: [  EventEmitterModule.forRoot() ,SecurityJwtModule, GerenteModule, AuthModule, FeatureModule, FuncionarioModule, NotificacaoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
