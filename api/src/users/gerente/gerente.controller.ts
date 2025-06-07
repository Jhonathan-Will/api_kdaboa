import { Controller, Get, Post, Body, Req, UseGuards, HttpException } from '@nestjs/common';
import { GerenteService } from './gerente.service';
import { CriarEstabelecimentoDTO } from './dto/criarEstabelecimento.dto';
import { RefreshGuard } from 'src/security/jwt/guard/refresh.guard';
import { ApiOperation } from '@nestjs/swagger';
import { CriarEnderecoDTO } from './dto/criarEndreço.dto';

@Controller("gerente")
export class GerenteController {
    constructor(private readonly gerenteService: GerenteService) {}

    //rota de cadastrar estabelecimento 
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra o estabelecimento do usuário'})
    @Post("/establishment")
    CriarEstabelecimento(@Body() estabelecimento: CriarEstabelecimentoDTO,  @Req() req: any)  {
        return this.gerenteService.criarEstabelecimento(estabelecimento, req.user.sub);
    }

    //rota para cadastrar endereço
    @UseGuards(RefreshGuard)
    @ApiOperation({summary: 'Cadastra um novo endereço'})
    @Post("/address")
    CadastrarEndreco(@Body() endereco: CriarEnderecoDTO, @Req() req: any) {
        const csrfToken = req.cookies['x-csrf-token'] || req.headers['x-csrf-token'];
        
        this.gerenteService.cadastrarEndereco(endereco, req.user, csrfToken)
    }
}