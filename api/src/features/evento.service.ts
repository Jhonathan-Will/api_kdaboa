import { Injectable } from "@nestjs/common";
import { Evento } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CriarEventoDTO } from "src/users/gerente/dto/criarEvento.dto";
@Injectable()
export class EventoService {
  
    constructor(private prisma: PrismaService) { }

    async cadastraEvento(data: CriarEventoDTO, id_est: number, status: number, foto: string) {
        return this.prisma.evento.create({

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
        return await this.prisma.evento.findMany({
            where: {
                estatus: Number(process.env.EVENT_STATUS_CRIADO)
            },
            include: {
                Estabelecimento: {
                    select: {
                        imagem: true,
                    }
                },
                Endereco: true,
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

    async buscaPorEstabelecimento(id_est: number, onlyActive: boolean) {
        return await this.prisma.evento.findMany({
            where: { 
                id_estabelecimento: id_est,
                ...(onlyActive && {estatus: Number(process.env.EVENT_STATUS_CRIADO)})
            },
            include: {
                Endereco: true,
                Estabelecimento: {
                    include: {
                        Contato: true,
                        Galeria: true
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

    async buscaEmQuarentenaPorEstabelecimento(id_est: number) {
        return await this.prisma.evento.findMany({
            where: {
                id_estabelecimento: id_est,
                estatus: Number(process.env.EVENT_STATUS_PENDENTE)
            },
            include: {
                Endereco: true,
                Estabelecimento: {
                    include: {
                        Contato: true,
                        Galeria: true
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

    async buscaEventoPorId(eventId: number, onlyActive: boolean) {
        return await this.prisma.evento.findUnique({
            where: { 
                id_evento: eventId,
                ...(onlyActive ? {estatus: Number(process.env.EVENT_STATUS_CRIADO)} : {estatus: Number(process.env.EVENT_STATUS_PENDENTE)})
            },
            include: {
                Endereco: true,
                Estabelecimento: {
                    include: {
                        Contato: true,
                        Galeria: true,
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

    async buscaEventosFiltrados(filtros: { name?: string; category?: number[]; city?: string, date?: Date }) {
        try{
            const { name, category, city, date } = filtros;
            return this.prisma.evento.findMany({
                where: {
                    estatus: Number(process.env.EVENT_STATUS_CRIADO),
                    ...(name && { nome_evento: { contains: name } }),
                    ...(date && {
                        data_inicio: {
                            gte: date,
                            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                        }
                    }),
                    ...(category && category.length > 0 && {
                        Evento_Categoria: {
                            some: { id_categoria: { in: category } }
                        },
                    }),
                    ...(city && {
                        Endereco: {
                            cidade: { contains: city }
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

        }catch(error){
        console.error('Erro em buscaEventosFiltrados:', error);
        throw new Error(`Erro em buscaEventosFiltrados: ${error.message}`);
        }   
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

    async alteraEstatus(eventId: number, status: number) {
        return this.prisma.evento.update({
            where: { id_evento: eventId },
            data: { estatus: status }
        });
    }

    async alteraEvento(data: CriarEventoDTO, foto: string, eventId: number) {
        try {
            return this.prisma.evento.update({
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
            where: { id_evento: eventId }
        })
    }

}