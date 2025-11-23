import { Injectable } from "@nestjs/common";
import { contains } from "class-validator";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class HistoricoService {
    constructor(private prisma: PrismaService) {}

    async adicionaHistorico(data: any) {
        await this.prisma.historico.create({
                data,
                include: {
                    Evento_Historico: true,
                },
        }).then((response) => {
            return response;
        }).catch((error) => {
            console.error("Erro ao alterar evento:", error);
            throw new Error("Erro ao alterar evento");
        });
    }

    async encontraHistorico(id: number){
        return await this.prisma.historico.findMany({
            where: {
                id_his: id
            }
        })
    }

    async encontraHistoricoPorEvento(id: number) {
        return await this.prisma.historico.findMany({
            select: {
                id_his: true,
                campo: true,
                valor_antigo: true,
                valor_novo: true,
            },
            where: {
                Evento_Historico: {
                   some: {
                        id_evento: id
                   }  
                }
            },
        });
    }

    async editarHistorico(id_his: number, data: any){
        return await this.prisma.historico.update({
            where: {
                id_his
            },
            data
        })
    }

    async deletaHistorico(id:number) {
        return await this.prisma.historico.delete({
            where:{
                id_his: id
            }
        })
    }
}