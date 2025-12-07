import { Controller, Delete, Get, HttpStatus, Param, Put, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from 'express';
import { NotificacaoService } from "./notificacao.service";
import { RefreshGuard } from "src/security/jwt/guard/refresh.guard";
import { CsrfService } from "src/security/csrf/csrf.service";


@Controller("notificacao")
export class NotificacaoController {
    constructor(private readonly notificacaoService: NotificacaoService,
                private readonly csrf: CsrfService) {}

    @UseGuards(RefreshGuard)
    @Get()
    async BuscaNotificacao(@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.notificacaoService.buscaTodasNotificacoesDoUsuario(req.user.sub))
        }   
    }

    @UseGuards(RefreshGuard)
    @Put("/:id")
    async MarcaNotificacaoComoLida(@Param('id') id_not: number ,@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.notificacaoService.marcarComoLida(req.user.sub, id_not))
        }
    }

    @UseGuards(RefreshGuard)
    @Put()
    async MarcaTodasNotificacoesComoLida(@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.notificacaoService.marcarTodasComoLida(req.user.sub))
        }
    }

    @UseGuards(RefreshGuard)
    @Delete("/:id")
    async DeletaNotificacao(@Param('id') id_not: number ,@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.notificacaoService.deletaNotificacao(req.user.sub, id_not))
        }
    }

    @UseGuards(RefreshGuard)
    @Delete()
    async DeletaTodasNotificacao(@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.notificacaoService.deletaTodasNotificacao(req.user.sub))
        }
    }
}