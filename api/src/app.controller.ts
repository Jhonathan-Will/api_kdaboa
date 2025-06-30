import { Controller, Get, HttpStatus, Param, Redirect, Req, Res } from '@nestjs/common';
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
}