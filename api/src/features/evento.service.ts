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
                data_criacao: new Date(),
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
    async buscaTodosEventos() {
        return await this.prisma.evento.findMany()
    }

    async buscaPorEstabelecimento(id_est: number) {
        return await this.prisma.evento.findMany({
            where: {id_estabelecimento: id_est},
            include: {
            Endereco: true,
            Estabelecimento: {
                include: {
                    Contato: true
                }
            },
                Evento_Categoria: {
                    include: {
                        Categoria: {
                            select: {
                                id_categoria: true,
                                nome_categoria: true,
                                icone: true
                            }
                        }
                    }
                }
            }
        })
    }

    async buscaEventoPorId(eventId: number) {
        return await this.prisma.evento.findUnique({
            where: { id_evento: eventId },
            include: {
            Endereco: true,
            Estabelecimento: {
                include: {
                    Contato: true
                }
            },
            Evento_Categoria: {
                include: {
                Categoria: {
                    select: {
                    id_categoria: true,
                    nome_categoria: true,
                    icone: true
                    }
                }
                }
            }
            }
        });
    }

    async buscaEventosFiltrados(filtros: { name?: string; category?: number[]; date?: string }) {
        const { name, category, date } = filtros;

        return this.prisma.evento.findMany({
            where: {
                ...(name && { nome_evento: { contains: name } }),
                ...(date && {
                    data_inicio: {
                        gte: new Date(`${date}T00:00:00.000Z`),
                        lte: new Date(`${date}T23:59:59.999Z`)
                    }
                }),
                ...(category && category.length > 0 && {
                    Evento_Categoria: {
                        some: { id_categoria: {in: category} }
                    }
                })
            },
            include: {
                Endereco: true,
                Estabelecimento: {
                    include: {
                        Contato: true
                    }
                },
                Evento_Categoria: {
                    include: {
                        Categoria: {
                            select: {
                                id_categoria: true,
                                nome_categoria: true,
                                icone: true
                            }
                        }
                    }
                },
            }
        })
    }

    async alteraCategoria(eventId: number, data: Array<number>) {
        // Remove todas as categorias antigas do evento
        await this.prisma.evento_Categoria.deleteMany({
            where: { id_evento: eventId }
        });

        // Adiciona as novas categorias
        await this.prisma.evento_Categoria.createMany({
            data: data.map(id_categoria => ({
                id_evento: eventId,
                id_categoria
            }))
        });
    }

    async alteraEvento(data: CriarEventoDTO, foto: string, eventId: number) {
        try {
            return  this.prisma.evento.update({
                where: { id_evento: eventId },
                data: {
                    nome_evento: data.nome,
                    descricao: data.descricao,
                    data_inicio: data.data_inicio,
                    data_fim: data.data_fim,
                    foto,
                    id_endereco: data.id_endereco,
                },
                include: {
                    Evento_Categoria: true,
                    Estabelecimento: {
                        include: {
                            Contato: true
                        }
                    }
                },
            })
        } catch (error) {
            console.log(error)    
        }
    }

    async deletaEvento(eventId: number) {
        return await this.prisma.evento.delete({
            where: {id_evento: eventId}
        })
    }

}