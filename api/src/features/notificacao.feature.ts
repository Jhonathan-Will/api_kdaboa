import { Injectable } from "@nestjs/common";
import { NotificacaoCreateInput, NotificacaoModel } from "../../generated/prisma/models";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificacaoFeature {
    constructor(private prisma: PrismaService) {}  

    async adicionaNotificacao(data: NotificacaoCreateInput) {
        return await this.prisma.notificacao.create({
            data,
        })
    }

    async buscaNotificacaoPorId(id: number) {
        return await this.prisma.notificacao.findUnique({
            where: { id_not: id}
        })
    }

    async buscaNotificacaoDoUsuario(userId: number) {
        return await this.prisma.notificacao.findMany({
            where: { id_usuario: userId}
        })
    }

    async alteravizualizacaoNotificacao(id: number, lida: boolean) {
        return await this.prisma.notificacao.update({
            where: { id_not: id },
            data: { lida: lida }
        })
    }

    async alteraVisuzalizacaoDeTodasNoticacao(userId: number) {
        return await this.prisma.notificacao.updateMany({
            where: { id_usuario: userId },
            data: { lida: true }
        })
    }

    async deletaNotificacao(id_not: number) {
        await this.prisma.notificacao.delete({
            where: { id_not: id_not }
        })           
    }

    async deletaTodasNotificacao(userId: number) {
        await this.prisma.notificacao.deleteMany({
            where: { id_usuario: userId }
        })
    }
}