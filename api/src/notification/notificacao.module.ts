import { Module } from '@nestjs/common';
import { EventoListener } from './listeners/criaEvento.listener';
import { FeatureModule } from 'src/features/features.module';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoController } from './notificacao.controller';
import { CsrfModule } from 'src/security/csrf/csrf.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ FeatureModule, CsrfModule, UsersModule ],
  controllers: [NotificacaoController],
  providers: [EventoListener, NotificacaoService],
})
export class NotificacaoModule {}
