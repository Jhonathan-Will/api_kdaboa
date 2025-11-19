import { HttpException, Injectable } from "@nestjs/common";
import { EventoService } from "src/features/evento.service";
import { CriarEventoDTO } from "./dto/criarEvento.dto";
import { UsersService } from "../users.service";
import { EventoDTO } from "./dto/evento.dto";
import { EstabelecimentoService } from "src/features/estabelecimento.service";
import { HistoricoService } from "src/features/historico.service";

@Injectable()
export class FuncionarioService {
    constructor(private readonly userService: UsersService,
                private readonly estabelecimentoService: EstabelecimentoService,
                private readonly eventoService: EventoService,
                private readonly historicoService: HistoricoService) {}

    async cadastraEvento(data: CriarEventoDTO, userId: number, file: string): Promise<EventoDTO>  {
        const user = await this.userService.getUserById(userId);

        if (!user || !user.id_estabelecimento) {
        throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
        }

        const estabelecimento = await this.estabelecimentoService.buscaEstabelecimento(user.id_estabelecimento);

        if(!estabelecimento || estabelecimento.Usuario[0].id_estabelecimento != user.id_estabelecimento) throw new HttpException({status: 404, error: 'Estabelecimento não encontrado'}, 404)
        return await this.eventoService.cadastraEvento(data, estabelecimento.id_estabelecimento, Number(process.env.EVENT_STATUS_PENDENTE), file)
        
    }

    //rota para alterar evento
    async alteraEvento(userId: number, eventId: number, file: string | null, data: CriarEventoDTO) {
        const user = await this.userService.getUserById(userId);

        if (!user || !user.id_estabelecimento) {
            throw new HttpException('Usuário não possui estabelecimento vinculado', 404);
        } 

        const event = await this.eventoService.buscaEventoPorId(eventId, true);
        
        if (!event || event.id_estabelecimento != user.id_estabelecimento) {
            throw new HttpException('Evento não encontrado', 404);
        }
        
        const history = await this.historicoService.encontraHistoricoPorEvento(event.id_evento);

        if(event.foto !== file) {
            const found = history.find(h => h.campo === "foto");
            if (found) {
                await this.historicoService.editarHistorico(found.id_his, {valor_novo : file});
            } else {
                const payload = {
                    id_usuario: user.id_usuario,
                    campo: "foto",
                    valor_antigo: event.foto,
                    valor_novo: file,
                    Evento_Historico: {
                        create: {
                            id_evento: event.id_evento
                        }
                    }
                };
                await this.historicoService.adicionaHistorico(payload);
            };
        }

        for (const record of Object.keys(data)) {

            if (!(record in event)) continue;

            const antigo = event[record];
            const novo = (data as any)[record];

            const antigoStr = antigo instanceof Date ? antigo.toISOString() : String(antigo ?? '');
            const novoStr = novo instanceof Date ? new Date(novo).toISOString() : String(novo ?? '');

            if (antigoStr === novoStr) continue; // sem alteração -> pula

            const existing = history.find(h => h.campo === record);

            if (existing) {

                if ( existing.valor_novo === novoStr ) continue;

                const payload = {
                    valor_novo: novoStr,
                };

                await this.historicoService.editarHistorico(existing.id_his, payload);

            } else {

                const payload = {
                    id_usuario: user.id_usuario,
                    campo: record,
                    valor_antigo: String(event[record]),
                    valor_novo: String(novo),
                    Evento_Historico: {
                        create: {
                            id_evento: event.id_evento
                        }
                    }
                };
                await this.historicoService.adicionaHistorico(payload);

            }
        }

        return { message: 'Alterações registradas no histórico'};
    }
}