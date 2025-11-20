import { Body, Controller, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { FuncionarioService } from "./funcionario.service";
import { CsrfService } from "src/security/csrf/csrf.service";
import { RefreshGuard } from "src/security/jwt/guard/refresh.guard";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { CriarEventoDTO } from "./dto/criarEvento.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from 'express';
import { UploadedFile } from '@nestjs/common';
import { ImageHandlePipe } from "src/common/pipe/imageHandle.pipe";

@Controller('funcionario')
export class FuncionarioController {
    constructor(private readonly funcionarioService: FuncionarioService,
                private readonly csrf: CsrfService) {}
    
    //rota para cadastrar evento
    @Post('/event')
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra novo evento para validar pelo gerente'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'string',
                    format: 'binary',
                    description: 'Imagem do evento'
                },
                nome_evento: {
                    type: 'string',
                    example: 'Festa de Aniversário',
                    description: 'Nome do evento'
                },
                descricao: {
                    type: 'string',
                    example: 'Uma festa incrível para celebrar meu aniversário',
                    description: 'Descrição do evento'
                },
                data_inicio: {
                    type: 'string',
                    example: '2023-10-15T18:00:00Z',
                    description: 'Data de início do evento'
                },
                data_fim: {
                    type: 'string',
                    example: '2023-10-15T23:59:59Z',
                    description: 'Data de fim do evento'
                },
                id_endereco: {
                    type: 'integer',
                    example: 1,
                    description: 'ID do estabelecimento onde o evento será realizado'
                },
                categoria: {
                    type: 'array',
                    items: { type: 'integer', example: 1 },
                    example: [1, 2, 3],
                    description: 'Categoria do evento, representada por um array de números'
                }
            },
            required: [
                'images',
                'nome',
                'descricao',
                'data_inicio',
                'data_fim',
                'id_endereco',
                'categoria'
            ]
        }
    })
    @UseInterceptors(FileInterceptor("images"))
    @ApiConsumes('multipart/form-data')
    async CadastraEvento(@Body() evento: CriarEventoDTO, @Req() req: any, @UploadedFile(  new ImageHandlePipe('events', true) ) file: Express.Multer.File) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            
            this.funcionarioService.cadastraEvento(evento, req.user.sub, file.filename)

        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }
    
    //rota para alterar evento
    @Put('/event/:id')
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Altera algum evento' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'string',
                    format: 'binary',
                    description: 'Imagem do evento'
                },
                nome_evento: {
                    type: 'string',
                    example: 'Festa de Aniversário',
                    description: 'Nome do evento'
                },
                descricao: {
                    type: 'string',
                    example: 'Uma festa incrível para celebrar meu aniversário',
                    description: 'Descrição do evento'
                },
                data_inicio: {
                    type: 'string',
                    example: '2023-10-15T18:00:00Z',
                    description: 'Data de início do evento'
                },
                data_fim: {
                    type: 'string',
                    example: '2023-10-15T23:59:59Z',
                    description: 'Data de fim do evento'
                },
                id_endereco: {
                    type: 'integer',
                    example: 1,
                    description: 'ID do estabelecimento onde o evento será realizado'
                },
                categoria: {
                    type: 'array',
                    items: { type: 'integer', example: 1 },
                    example: [1, 2, 3],
                    description: 'Categoria do evento, representada por um array de números'
                }
            },
            required: [
                'images',
                'nome_evento',
                'descricao',
                'data_inicio',
                'data_fim',
                'id_endereco',
                'categoria'
            ]
        }
    })
    @UseInterceptors(FileInterceptor('images'))
    @ApiConsumes('multipart/form-data')
    async AltaraEvento(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile( new ImageHandlePipe('events', false)) file: Express.Multer.File,
        @Body() evento: CriarEventoDTO,
        @Req() req: any,
        @Res() res: Response
    ) {
        if (!this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            throw new HttpException({ status: 403, error: 'Token CSRF inválido' }, 405);
        }

        res.status(HttpStatus.OK).json(
            await this.funcionarioService.alteraEvento(req.user.sub, id, file.filename, evento)
        );
    }
}