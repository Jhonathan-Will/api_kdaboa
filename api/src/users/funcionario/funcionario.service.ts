import { HttpException, Injectable } from "@nestjs/common";
import { EventoService } from "src/features/evento.service";
import { CriarEventoDTO } from "./dto/criarEvento.dto";
import { UsersService } from "../users.service";
import { EventoDTO } from "./dto/evento.dto";
import { EstabelecimentoService } from "src/features/estabelecimento.service";

@Injectable()
export class FuncionarioService {
    constructor(private readonly userService: UsersService,
                private readonly estabelecimentoService: EstabelecimentoService,
                private readonly eventoService: EventoService) {}

    async cadastraEvento(data: CriarEventoDTO, userId: number, file: string): Promise<EventoDTO>  {
        const user = await this.userService.getUserById(userId);

        if (!user || !user.id_estabelecimento) {
        throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
        }

        const estabelecimento = await this.estabelecimentoService.buscaEstabelecimento(user.id_estabelecimento);

        if(!estabelecimento || estabelecimento.Usuario[0].id_estabelecimento != user.id_estabelecimento) throw new HttpException({status: 404, error: 'Estabelecimento não encontrado'}, 404)
        return await this.eventoService.cadastraEvento(data, estabelecimento.id_estabelecimento, Number(process.env.EVENT_STATUS_PENDENTE), file)
        
    }
}