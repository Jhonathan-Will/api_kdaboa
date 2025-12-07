import { Injectable } from "@nestjs/common";
import { OnEvent } from '@nestjs/event-emitter';
import { NotificacaoFeature} from "src/features/notificacao.feature";
import { NotificacaoCreateInput } from "generated/prisma/models";

@Injectable()
export class EventoListener {
    constructor(private readonly notificacaoService: NotificacaoFeature) {}

  @OnEvent('evento.criado')
  handleEventoCriadoEvent(payload: NotificacaoCreateInput) {

      payload = {...payload,             
                titulo: 'Novo evento cadastrado',
                data_envio: new Date(),
                tipo: 'Criado',
                lida: false}

      this.notificacaoService.adicionaNotificacao(payload)
  }

  @OnEvent('evento.alterado')
  handleEventoAleradoEvent(payload: NotificacaoCreateInput) {

    console.log('evento alterado listener chamado')

      payload = {...payload,
                titulo: 'Evento alterado',
                data_envio: new Date(),
                tipo: 'Alterado',
                lida: false}

      this.notificacaoService.adicionaNotificacao(payload)

  }

  @OnEvent('evento.deletado')
  handleEventoDeletadoEvent(payload: NotificacaoCreateInput) {

    console.log('evento deletado')

      payload = {...payload,
                titulo: 'Evento deletado',
                data_envio: new Date(),
                tipo: 'Deletado',
                lida: false}
      
      this.notificacaoService.adicionaNotificacao(payload)
  }

  @OnEvent('evento.aprovado')
  handleEventoAprovadoEvent(payload: NotificacaoCreateInput) {

    console.log('evento aprovado listener chamado')

      payload = {...payload,
                data_envio: new Date(),
                tipo: 'Aprovado',
                lida: false}
                
      this.notificacaoService.adicionaNotificacao(payload)
  }
}
