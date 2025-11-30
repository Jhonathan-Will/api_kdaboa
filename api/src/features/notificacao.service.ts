import { Injectable } from "@nestjs/common";
import { NotificacaoModel } from "../../generated/prisma/models";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificacaoService {
    constructor(private prisma: PrismaService) {}  

    async adicionaNotificacao(data: NotificacaoModel) {
        return await this.prisma.notificacao.create({
            data,
        })
    }
}