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
}