import { Body, Controller, Get, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
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
        console.log("aaaaaa")

        
        try {
            // lógica aqui
            return await this.authService.singIn(gerente).catch((error) => {
                console.log(error)
            });
        } catch (err) {
            console.error('Erro no signin:', err);

        }
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
    async verifyEmail(@Query('token') token: string, @Res() res: any) {
        await this.authService.verifyEmail(token).then((response) => {
            res.redirect(`${process.env.FRONTEND_URL}/`)
        }).catch((error)  => {
            return error;
        });
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
    async verificaEmailTrocaSenha(@Query('token') token: string, @Res() res: any, @Req() req: any) {
        await this.authService.verifyChangePasswordEmail(token).then((response) => {

            const sessionId = req.ip || 'anon';
            const csrfToken = generateCsrfToken(sessionId);

            res.cookie('x-csrf-token', csrfToken,{httpOnly: false,
                                                  secure: false,       
                                                  sameSite: 'strict',
                                                  path:'/auth/change-password'})

            res.cookie('token', response.token,{httpOnly: true,
                                                secure:  true,
                                                sameSite: 'strict',
                                                path:'/auth/change-password'})
            return res.redirect(`${process.env.FRONTEND_URL}/alterar-senha`);
        }).catch((error) => {
            return error;
        });
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

        const sessionId = req.ip || 'anon';
        const csrfToken = req.cookies['x-csrf-token'] || req.headers['x-csrf-token'];
        console.log(validateRequest(sessionId, csrfToken)) 

        return await this.authService.changePassword(novaSenha, req.user).then((response) => {
            console.log(response);
        }).catch((error) => {
           console.log(error);
        });
    }

}


function validateRequest(sessionId: string, csrfToken: string): boolean {
    if (!sessionId || !csrfToken) {
        throw new Error('Invalid CSRF token or session');
    }
    return true;
}
function generateCsrfToken(sessionId: string): string {
    return Buffer.from(sessionId + Date.now().toString()).toString('base64');
}
