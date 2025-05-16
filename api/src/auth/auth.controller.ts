import { Body, Controller, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CriarGereneteDTO } from './dto/create.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { ChangeSenhaDTO } from './dto/change-senha.dto';
import { NewPassword } from './dto/new-password.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    //Rotas de Cadastro e Login
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
        console.log(token)
        return await this.authService.verifyEmail(token);
    }

    //Rotas de Troca de Senha
    @ApiOperation({ summary: 'Solicita troca de senha' })
    @ApiResponse({ status: 200, description: 'E-mail de recuperação enviado com sucesso.' })
    @ApiResponse({ status: 400, description: 'E-mail inválido ou não encontrado.' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @Post("recovery-password")
    async enviaEmailTrocarSenha(@Body() email : ChangeSenhaDTO) {
        return await this.authService.sendChangePasswordEmail(email);
    }

    @ApiOperation({ summary: 'Verifica e-mail para troca de senha' })
    @ApiResponse({ status: 200, description: 'E-mail verificado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiQuery({name: "token", required: true, description: "Token de verificação"})
    @Get("recovery-password")
    async verificaEmailTrocaSenha(@Query('token') token: string) {
        return await this.authService.verifyChangePasswordEmail(token);
    }


    @ApiBearerAuth('Authorization')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Troca a senha' })
    @ApiResponse({ status: 200, description: 'Senha trocada com sucesso.' })
    @ApiResponse({ status: 400, description: 'Requisição inválida.' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiBody({ type: NewPassword })
    @Put("change-password")
    async trocaSenha(@Body() novaSenha: NewPassword, @Req() req: any) {
            return await this.authService.changePassword(novaSenha, req.user);
    }

}
