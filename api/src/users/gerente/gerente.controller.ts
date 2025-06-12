import { Controller, Get, Post, Body, Req, UseGuards, HttpException, UseInterceptors, Put, Delete } from '@nestjs/common';
import { GerenteService } from './gerente.service';
import { CriarEstabelecimentoDTO } from './dto/criarEstabelecimento.dto';
import { RefreshGuard } from 'src/security/jwt/guard/refresh.guard';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CriarEnderecoDTO } from './dto/criarEndreço.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AlteraEstabelecimentoDTO } from './dto/alteraEstabelecimento.dto';
import { CsrfService } from 'src/security/csrf/csrf.service';
import { AlteraEnderecoDTO } from './dto/alteraEndereco.dto';
import { DeletaEnderecoDTO } from './dto/deletaEndereco.dto';
import { ContatoDTO } from './dto/contato.dto';

@Controller("gerente")
export class GerenteController {
    constructor(private readonly gerenteService: GerenteService,
                private readonly csrf: CsrfService) {}

    //rota de cadastrar estabelecimento 
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra o estabelecimento do usuário'})
    @Post("/establishment")
    CriarEstabelecimento(@Body() estabelecimento: CriarEstabelecimentoDTO,  @Req() req: any)  {
        return this.gerenteService.criarEstabelecimento(estabelecimento, req.user.sub, req.user.tipo);
    }

    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Altera o estabelecimento do usuário' })
    @Put("/establishment")
    AlteraEstabelecimento(@Body() estabelecimento: AlteraEstabelecimentoDTO, @Req() req: any) {
        const csrfToken = req.cookies['x-csrf-token'] || req.headers['x-csrf-token']

        if (!this.csrf.validateToken(csrfToken)){
            console.log(this.csrf.validateToken(csrfToken))
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }

        this.gerenteService.alteraEstabelecimento(estabelecimento, req.user.sub)  
    }

    //rota para cadastrar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({summary: 'Cadastra um novo endereço'})
    @Post("/address")
    CadastrarEndreco(@Body() endereco: CriarEnderecoDTO, @Req() req: any) {
        const csrfToken = req.cookies['x-csrf-token'] || req.headers['x-csrf-token'];
        
        this.gerenteService.cadastrarEndereco(endereco, req.user, csrfToken)
    }

    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Busca o endereço do usuário' })
    @Get("/address")
    BuscaEndereco(@Req() req: any) {
        if(this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.buscaEndereco(req.user.sub);
        }else{
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

    //rota para alterar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Altera o endereço do usuário' })
    @Put("/address")
    AlteraEndereco(@Body() endereco: AlteraEnderecoDTO, @Req() req: any) {
        if(this.csrf.validateToken(req.headers['x-csrf-token'] || req.cookies['x-csrf-token'])) {
            return this.gerenteService.alteraEndereco(endereco, req.user.sub);
        }
    }

    //rota para deletar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Deleta o endereço do usuário' })
    @Delete("/address")
    DeletaEndereco(@Body() id: DeletaEnderecoDTO, @Req() req: any) {

        if(this.csrf.validateToken(req.headers['x-csrf-token'] || req.cookies['x-csrf-token'])) {
            return this.gerenteService.deletaEndereco(id.id, req.user.sub);
        } else {
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }   

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
            destination: join(__dirname,"..","..","images","gallery").replace("dist", "src"),
            filename: (req, file, cb) => {
                const randomPart = Math.round(Math.random() * 1E12).toString().slice(-10);
                const uniqueSuffix = req.user.sub + "-" + Date.now() + '-' + randomPart;
                const extension = extname(file.originalname);

                const fileName = `${uniqueSuffix}`;
                const filePath = join(__dirname,"..","..","images","gallery", fileName).replace("dist", "src");
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

        console.log(req.file)

        return this.gerenteService.cadastrarFotoGaleria(req.user.sub, req.file.filename)
    }

    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Busca as imagens da galeria do usuário' })
    @Delete("/gallery")
    DeletaGaleria(@Body() id: DeletaEnderecoDTO, @Req() req: any) {
        if(this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.deletaGaleria(id.id, req.user.sub);
        }else{
            throw new HttpException({
            status: 403,
            error: 'Token CSRF inválido'
            }, 405);
        }
    }

    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra maneira de contato' })
    @Post("/contact")
    CadastraContato(@Body() contato: ContatoDTO, @Req() req: any) {
        if(this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.cadastaContato(contato, req.user.sub)
        }else{
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Altera contato do estabelecimento' })
    @Put("/contact")
    AlteraContato(@Body() contato: ContatoDTO, @Req() req: any) {
        if(this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            return this.gerenteService.alteraContato(contato, req.user.sub);
        }else{
            throw new HttpException({
                status: 403,
                error: 'Token CSRF inválido'
            }, 405);
        }
    }

}