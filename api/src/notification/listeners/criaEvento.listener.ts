import { Injectable } from "@nestjs/common";
import { OnEvent } from '@nestjs/event-emitter';
import { NotificacaoService } from "src/features/notificacao.service";
import { NotificacaoCreateInput, NotificacaoModel } from "generated/prisma/models";

@Injectable()
export class CriaEventoListener {
    constructor(private readonly notificacaoService: NotificacaoService) {}

  @OnEvent('evento.criado')
  handleEventoCriadoEvent(payload: NotificacaoCreateInput) {
      const response = this.notificacaoService.adicionaNotificacao(payload)
  }
}