import { HttpException, Injectable } from "@nestjs/common";

import { NotificacaoFeature } from "src/features/notificacao.feature";
import { UsersService } from "src/users/users.service";

@Injectable()
export class NotificacaoService {
    constructor(private readonly notificacaoFeature: NotificacaoFeature,
                private readonly userService: UsersService) {}

    //busca todas as notificações do usuário
    async buscaTodasNotificacoesDoUsuario(userId: number) {
        const user = await this.userService.getUserById(userId)

        if (!user ) throw new HttpException('Usuário não encontrado', 404);
        if (!user.id_estabelecimento) throw new HttpException('Usuário não está vinculado a um estabelecimento', 400);

        return await this.notificacaoFeature.buscaNotificacaoDoUsuario(userId)
    }

    //marca uma notificação como lida
    async marcarComoLida(userId: number, notificacaoId: number) {
        const user = await this.userService.getUserById(userId)
        const notificacao = await this.notificacaoFeature.buscaNotificacaoPorId(notificacaoId);

        if (!notificacao) throw new HttpException('Notificação não encontrada', 404);
        if (notificacao.id_usuario !== userId) throw new HttpException('Notificação não pertence ao usuário', 403);
        if (!user ) throw new HttpException('Usuário não encontrado', 404);
        if (!user.id_estabelecimento) throw new HttpException('Usuário não está vinculado a um estabelecimento', 400);


        return await this.notificacaoFeature.alteravizualizacaoNotificacao(notificacaoId, true)
    }

    async marcarTodasComoLida(userId: number) {
        const user = await this.userService.getUserById(userId)

        if (!user ) throw new HttpException('Usuário não encontrado', 404);
        if (!user.id_estabelecimento) throw new HttpException('Usuário não está vinculado a um estabelecimento', 400);

        return await this.notificacaoFeature.alteraVisuzalizacaoDeTodasNoticacao(userId)
    }

    async deletaNotificacao(userId: number, notificacaoId: number) {
        try {

            const user = await this.userService.getUserById(userId)
            const notificacao = await this.notificacaoFeature.buscaNotificacaoPorId(notificacaoId);
    
            if (!notificacao) throw new HttpException('Notificação não encontrada', 404);
            if (notificacao.id_usuario !== userId) throw new HttpException('Notificação não pertence ao usuário', 403);
            if (!user ) throw new HttpException('Usuário não encontrado', 404);
            if (!user.id_estabelecimento) throw new HttpException('Usuário não está vinculado a um estabelecimento', 400);
    
            return await this.notificacaoFeature.deletaNotificacao(notificacaoId)
        } catch (error) {
            console.log(error)
        }
    }

    async deletaTodasNotificacao(userId: number) {
        const user = await this.userService.getUserById(userId)

        if (!user ) throw new HttpException('Usuário não encontrado', 404);
        if (!user.id_estabelecimento) throw new HttpException('Usuário não está vinculado a um estabelecimento', 400);

        return await this.notificacaoFeature.deletaTodasNotificacao(user.id_usuario)
    }
}