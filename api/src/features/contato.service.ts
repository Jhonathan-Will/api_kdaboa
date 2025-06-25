import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ContatoService {
    constructor(private prisma: PrismaService){}

    async criaContato(data: any, id_estabelecimento: number) {
        await this.prisma.estabelecimento.update({
            where: {id_estabelecimento: id_estabelecimento},
            data: {
                Contato: {
                    create: {
                        ...data
                    }
                }
            },
            include: {
                Contato: true
            }
        }).then((response) => {
            return response.Contato;
        }).catch(error => {
            console.log(error)
            throw new Error('Erro ao criar contato');
        })
    }

    async encontraContatoPorEstabelecimento(id_estabelecimento: number) {
        return await this.prisma.contato.findFirst({
            where: {Estabelecimento: {id_estabelecimento: id_estabelecimento}},
        }).then((response) => {
            return response;
        }).catch(error => {
            console.log(error)
            throw new Error('Erro ao encontrar contato');
        })
    }

    async alteraContato(data: any, id: number) {
        await this.prisma.contato.update({
            where: {id_contato: id},
            data: {
                ...data
            },
        }).then((response) => {
            return response;
        }).catch(error => {
            console.log(error)
            throw new Error('Erro ao alterar contato');
        })
    }
}