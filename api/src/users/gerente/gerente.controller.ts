import { Controller, Get, Post, Body, Req, UseGuards, HttpException, UseInterceptors, Put, Delete, Res, HttpStatus, Query, Param } from '@nestjs/common';
import { GerenteService } from './gerente.service';
import { CriarEstabelecimentoDTO } from './dto/criarEstabelecimento.dto';
import { RefreshGuard } from 'src/security/jwt/guard/refresh.guard';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CriarEnderecoDTO } from './dto/criarEndreço.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AlteraEstabelecimentoDTO } from './dto/alteraEstabelecimento.dto';
import { CsrfService } from 'src/security/csrf/csrf.service';
import { AlteraEnderecoDTO } from './dto/alteraEndereco.dto';
import { DeletaEnderecoDTO } from './dto/deletaEndereco.dto';
import { ContatoDTO } from './dto/contato.dto';
import { CriarEventoDTO } from './dto/criarEvento.dto';
import { Response } from 'express';
import { DeletaGaleriaDTO } from './dto/deletaGaleria.dto';
import { CriaFunctionarioDTO } from './dto/criaFuncionario';

@Controller("gerente")
export class GerenteController {
    constructor(private readonly gerenteService: GerenteService,
        private readonly csrf: CsrfService) { }

    //rota de cadastrar estabelecimento 
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra o estabelecimento do usuário' })
    @Post("/establishment")
    async CriarEstabelecimento(@Body() estabelecimento: CriarEstabelecimentoDTO, @Req() req: any, @Res() res: Response) {
        await this.gerenteService.criarEstabelecimento(estabelecimento, req.user.sub, req.user.tipo).then((response) => {
            res.status(HttpStatus.CREATED).json(response)
        });
    }

    //rota pra pegar estabelecimento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Busca estbalecimento pelo token do usuário' })
    @Get("/establishment")
    async PegarEstabelecimento(@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.gerenteService.buscaEstabelecimentoPorUserId(req.user.sub))
        }
    }

    //rota para alterar estabelecimento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Altera o estabelecimento do usuário' })
    @Put("/establishment")
    AlteraEstabelecimento(@Body() estabelecimento: AlteraEstabelecimentoDTO, @Req() req: any) {
        const csrfToken = req.cookies['x-csrf-token'] || req.headers['x-csrf-token']

        if (!this.csrf.validateToken(csrfToken)) {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }

        this.gerenteService.alteraEstabelecimento(estabelecimento, req.user.sub)
    }

    //rota para cadastrar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra um novo endereço' })
    @Post("/address")
    async CadastrarEndreco(@Body() endereco: CriarEnderecoDTO, @Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            await this.gerenteService.cadastrarEndereco(endereco, req.user).then(response => {
                console.log(response)
                res.status(HttpStatus.CREATED).json(response)
            });
        }

    }

    //rota para buscar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Busca o endereço do usuário' })
    @Get("/address")
    BuscaEndereco(@Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.buscaEndereco(req.user.sub);
        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

    //rota para alterar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Altera o endereço do usuário' })
    @Put("/address/:id")
    AlteraEndereco(@Param('id') id: number, @Body() endereco: AlteraEnderecoDTO, @Req() req: any) {
        if (this.csrf.validateToken(req.headers['x-csrf-token'] || req.cookies['x-csrf-token'])) {
            return this.gerenteService.alteraEndereco(endereco, req.user.sub, id);
        }
    }

    //rota para deletar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Deleta o endereço do usuário' })
    @Delete("/address")
    DeletaEndereco(@Query('id') id: string, @Req() req: any) {

        if (this.csrf.validateToken(req.headers['x-csrf-token'] || req.cookies['x-csrf-token'])) {
            return this.gerenteService.deletaEndereco(Number(id), req.user.sub);
        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

    //rota para cadastrar foto na galeria
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra uma nova galeria de imagens' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('images', {
        storage: diskStorage({
            destination: join(__dirname, "..", "..", "images", "gallery").replace("dist", "src"),
            filename: (req, file, cb) => {
                const randomPart = Math.round(Math.random() * 1E12).toString().slice(-10);
                const uniqueSuffix = req.user.sub + "-" + Date.now() + '-' + randomPart;
                const extension = extname(file.originalname);

                const fileName = `${uniqueSuffix}`;
                const filePath = join(__dirname, "..", "..", "images", "gallery", fileName).replace("dist", "src");
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
    @Post("/gallery")
    CadastrarGaleria(@Body() body: any, @Req() req: any) {

        if (!req.file) {
            throw new HttpException({
                status: 400,
                error: 'Nenhum arquivo enviado'
            }, 400)
        }

        return this.gerenteService.cadastrarFotoGaleria(req.user.sub, req.file.filename)
    }

    //rota para buscar galeria pelo token do usuario
    @ApiOperation({ summary: 'Busca por todas as fotos da galeria pelo token' })
    @UseGuards(RefreshGuard)
    @Get('/gallery')
    async BuscaTodasFotosDaGaleria(@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.gerenteService.buscaGaleiraPorEstabelecimento(req.user.sub))
        }
    }

    //rota para deletar foto da galeria
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Deleta uma imagem da galeria do usuário' })
    @Delete("/gallery")
    DeletaGaleria(@Body() body: DeletaGaleriaDTO, @Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.deletaGaleria(body.nome, req.user.sub);
        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido',
            }, 405);
        }
    }

    //rota para cadastrar contato para estabelecimento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra maneira de contato' })
    @Post("/contact")
    CadastraContato(@Body() contato: ContatoDTO, @Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.cadastaContato(contato, req.user.sub)
        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

    //rota para buscar contato do estabelecimento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'busca pelos contatos do estabelecimento' })
    @Get('/contact')
    async BuscaContato(@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.gerenteService.buscaContato(req.user.sub))
        }
    }

    //rota para alterar contato do estabelecimento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Altera contato do estabelecimento' })
    @Put("/contact")
    AlteraContato(@Body() contato: ContatoDTO, @Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.alteraContato(contato, req.user.sub);
        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

    //rota para cadastrar evento para o estabelecimento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra um evento' })
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
                data_criacao: {
                    type: 'string',
                    example: '2023-10-01T12:00:00Z',
                    description: 'Data de criação do evento'
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
                'data_criacao',
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
    CadastraEvento(@Body() evento: CriarEventoDTO, @Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {

            this.gerenteService.cadastraEvento(evento, req.user.sub, req.file.filename)

        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

    //rota para pegar evento para o estbalecimento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Busca todos os eventos para o estabelecimento' })
    @Get('/event')
    async BuscaEstabelecimento(@Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.gerenteService.buscaEventoPorEstabelecimento(req.user.sub))
        }
    }

    //rota para alterar evento
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
                data_criacao: {
                    type: 'string',
                    example: '2023-10-01T12:00:00Z',
                    description: 'Data de criação do evento'
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
                'data_criacao',
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
    @Put('/event/:id')
    async AltaraEvento(@Param('id') id: number, @Body() evento: CriarEventoDTO, @Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.gerenteService.alteraEvento(req.user.sub, id, req.file.filename, evento))
        }
    }

    //rota para deletar um evento
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'deleta evento' })
    @Delete('/event/:id')
    async DeletaEvento(@Param('id') id: number, @Req() req: any, @Res() res: Response) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.gerenteService.deletaEvento(req.user.sub, id))
        }
    }

    @UseGuards(RefreshGuard)
    @ApiOperation({summary: 'Rota para cadastrar funcionário'})
    @Post('/employee')
    async CadastraFuncionario(@Body() funcionario: CriaFunctionarioDTO, @Res() res: Response, @Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.gerenteService.cadastraFuncionario(funcionario, req.user.sub))
        }
    }
}