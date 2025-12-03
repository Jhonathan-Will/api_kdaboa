import { Module } from '@nestjs/common';
import { CriaEventoListener } from './listeners/criaEvento.listener';
import { FeatureModule } from 'src/features/features.module';

@Module({
  imports: [ FeatureModule ],
  providers: [CriaEventoListener],
})
export class NotificacaoModule {}
