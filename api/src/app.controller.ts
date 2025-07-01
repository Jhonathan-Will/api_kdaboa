import { Controller, Get, HttpStatus, Param, ParseIntPipe, Redirect, Req, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
@Controller()
export class  AppController {

    constructor(private readonly appService: AppService) {}

    @Get("/")
    @Redirect("/api",  302)
    redirectToSwagger() {
        return { url: '/api' };
    }

    //rota para buscar uma foto da galeira
    @ApiOperation({summary: 'Busca por uma foto da galeira'})
    @Get('/gallery/:name')
    async BuscaFoto(@Param('name') name: string, @Req() req: any, @Res() res: Response) {
        res.sendFile(await this.appService.buscaFotoGaleria(name))
    }

    //rota para buscar foto de evento
    @ApiOperation({summary: 'busca pela foto do estabelecimento'})
    @Get('/event/image/:name')
    async BuscaFotoEvento(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(await this.appService.buscaFotoEvento(name))
    }

    //rota pra buscar evento pelo id
    @ApiOperation({summary: 'busca evento pelo id'})
    @Get('/event/:id')
    async BuscaEvento(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        res.status(HttpStatus.OK).json(await this.appService.buscaEvento(id))
    }
}