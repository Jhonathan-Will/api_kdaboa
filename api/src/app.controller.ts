import { Controller, Get, HttpStatus, Param, ParseIntPipe, Query, Redirect, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
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
    async BuscaEventoPorId(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        res.status(HttpStatus.OK).json(await this.appService.buscaEvento(id))
    }

    //rota para pegar todos os eventos
    @ApiOperation({summary: 'busca todos os eventos'})
    @ApiQuery({ name: 'name', required: false, description: 'Parte do nome do evento' })
    @ApiQuery({ name: 'category', required: false, description: 'ID da categoria', type: Number })
    @ApiQuery({ name: 'date', required: false, description: 'Data do evento (YYYY-MM-DD)', type: String })
    @Get('/event')
    async BuscaEventosFiltrados(@Res() res: Response,
                                @Query('name') name?: string,
                                @Query('category') category?: string[] | string,
                                @Query('date') date?: string) {
        let categories: number[] = [];
        if (Array.isArray(category)) {
            categories = category.map(Number);
        } else if (typeof category === 'string') {
            categories = category.split(',').map((v) => Number(v.trim()));
        } else if (category !== undefined) {
            categories = [Number(category)];
        }
        const [day,month, year] = date? date.split('/'): [undefined, undefined, undefined];

        res.status(HttpStatus.OK).json(await this.appService.filtraEvento({name, category: categories, date: !date ? undefined : new Date(`${year}-${month}-${day}T00:00:00.000Z`)}))
    }

    @ApiOperation({summary: 'busca pelo estabelecimento'})
    @Get("/estableshiment/:id")
    async buscaEstabelecimento(@Param('id') id: number, @Res() res: Response) {
        res.status(HttpStatus.OK).json(await this.appService.buscaEstabelecimento(id))
    }
}