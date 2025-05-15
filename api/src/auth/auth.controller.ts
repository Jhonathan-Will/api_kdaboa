import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CriarGereneteDTO } from './dto/create.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Cadastra gerente' })
    @ApiResponse({ status: 201, description: 'Gerente cadastrado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Gerente já existe ou domínio de e-mail não permitido.' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiBody({ type: CriarGereneteDTO })
    @Post("singin")
    async createGerente(@Body() gerente: CriarGereneteDTO) {
        return await this.authService.singIn(gerente);
    }

    @ApiOperation({ summary: 'Faz login' })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Credenciais inválidas.' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiBody({ type: LoginDTO })
    @Post("login")
    async login(@Body() user: LoginDTO) {
        return await this.authService.login(user)
    }

    @ApiOperation({ summary: 'Envia e-mail de verificação' })
    @ApiResponse({ status: 200, description: 'Verificação enviada com sucesso.' })
    @ApiResponse({ status: 400, description: 'Requisição inválida ou email já verificado' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiQuery({name: "token", required: true, description: "Token de verificação"})
    @Get("verify")
    async verifyEmail(@Query('token') token: string) {
        return await this.authService.verifyEmail(token);
    }

}
