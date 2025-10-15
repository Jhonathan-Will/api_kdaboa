import { Body, Controller, HttpException, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { FuncionarioService } from "./funcionario.service";
import { CsrfService } from "src/security/csrf/csrf.service";
import { RefreshGuard } from "src/security/jwt/guard/refresh.guard";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { CriarEventoDTO } from "./dto/criarEvento.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('funcionario')
export class FuncionarioController {
    constructor(private readonly funcionarioService: FuncionarioService,
                private readonly csrf: CsrfService) {}
    
    //rota para cadastrar evento
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
                nome: {
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
    @UseInterceptors(FileInterceptor('images', {
        storage: diskStorage({
            destination: join(__dirname, "..", "..", "images", "events").replace("dist", "src"),
            filename: (req, file, cb) => {
                const randomPart = Math.round(Math.random() * 1E12).toString().slice(-10);
                const uniqueSuffix = req.user.sub + "-" + Date.now() + '-' + randomPart;
                const extension = extname(file.originalname);

                const fileName = `${uniqueSuffix}`;
                const filePath = join(__dirname, "..", "..", "images", "events", fileName).replace("dist", "src");
                const fs = require('fs');
                if (fs.existsSync(filePath)) {
                    const newRandomPart = Math.round(Math.random() * 1E12).toString().slice(-10);
                    const newUniqueSuffix = req.user.sub + "-" + Date.now() + '-' + newRandomPart;
                    cb(null, `${newUniqueSuffix}${extension}`);
                } else {
                    cb(null, `${uniqueSuffix}${extension}`);
                }
            }
        })
    }))
    @ApiConsumes('multipart/form-data')
    @Post('/event')
    async CadastraEvento(@Body() evento: CriarEventoDTO, @Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {

            this.funcionarioService.cadastraEvento(evento, req.user.sub, req.file.filename)

        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

}