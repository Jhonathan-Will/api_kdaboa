import { Controller, Get, Post, Body, Req, UseGuards, HttpException } from '@nestjs/common';
import { GerenteService } from './gerente.service';
import { CriarEstabelecimentoDTO } from './dto/criarEstabelecimento.dto';
import { RefreshGuard } from 'src/security/jwt/guard/refresh.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller("gerente")
export class GerenteController {
    constructor(private readonly gerenteService: GerenteService) {}

    //rota de cadastrar estabelecimento 
    @UseGuards(RefreshGuard)
    @ApiOperation({ summary: 'Cadastra o estabelecimento do usuário'})
    @Post("/estabelcimento")
    CriarEstabelecimento(@Body() estabelecimento: CriarEstabelecimentoDTO,  @Req() req: any)  {
        return this.gerenteService.criarEstabelecimento(estabelecimento, req.user.sub);
    }
}