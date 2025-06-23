import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CriarEventoDTO } from "src/users/gerente/dto/criarEvento.dto";

@Injectable()
export class EventoService {
    constructor(private prisma: PrismaService){}

    async cadastraEvento(data: CriarEventoDTO, id_est: number, status: number, foto: string) {
      return  this.prisma.evento.create({
            data: {
                nome_evento: data.nome,
                descricao: data.descricao,
                data_criacao: data.data_criacao,
                data_inicio: data.data_inicio,
                data_fim: data.data_fim,
                estatus: status,
                foto,
                id_estabelecimento: id_est,
                id_endereco: data.id_endereco,

                Evento_Categoria: {
                    createMany: {
                        data: data.categoria.map((categoriaId: number) => ({ id_categoria: categoriaId }))
                    }
                }
            },
            include: {
                Evento_Categoria: true
            }
        })
    }

    async buscaPorEstabelecimento(id_est: number) {
        return await this.prisma.evento.findMany({
            where: {id_estabelecimento: id_est},
            include: {
                Evento_Categoria: true
            }
        })
    }
}