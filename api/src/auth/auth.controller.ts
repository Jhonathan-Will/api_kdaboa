import { Body, Controller, Get, Post, Put, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express'
import { CriarGereneteDTO } from './dto/create.dto';
import { AuthService } from './auth.service';
import { diskStorage } from 'multer';
import { LoginDTO } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiHeader, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ChangeSenhaDTO } from './dto/change-senha.dto';
import { NewPassword } from './dto/new-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefreshGuard } from 'src/security/jwt/guard/refresh.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';

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
        try {
            return await this.authService.singIn(gerente)
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
    async login(@Body() user: LoginDTO, @Res() res: any) {
        return await this.authService.login(user).then((response) => {
            res.cookie('x-csrf-token', response.csrfToken,{httpOnly: false,
                                                  secure: true,       
                                                  sameSite: 'lax',
                                                  path:"/"})

            res.cookie('token', response.access_token,{httpOnly: true,
                                                secure:  true,
                                                sameSite: 'lax',
                                                path:`/`})

            res.cookie('refresh_token', response.refresh_token, {httpOnly: true,
                                                                secure: true,
                                                                sameSite: 'lax',
                                                                path:'/'})
            res.send({message: 'login feito com sucesso'})
        }).catch((error) => {
            console.log(error)
            throw error
        })
    }

    @ApiOperation({ summary: 'Envia e-mail de verificação' })
    @ApiResponse({ status: 200, description: 'Verificação enviada com sucesso.' })
    @ApiResponse({ status: 400, description: 'Requisição inválida ou email já verificado' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiQuery({name: "token", required: true, description: "Token de verificação"})
    @Get('verify')
    async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
        await this.authService.verifyEmail(token);
        return res.redirect(`${process.env.FRONTEND_URL}/`);
    } catch (error) {
        console.error('Erro na verificação de e-mail:', error);
        return res.status(400).json({ message: 'Token inválido ou expirado' });
    }
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

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Verifica e-mail para troca de senha' })
    @ApiResponse({ status: 200, description: 'E-mail verificado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiQuery({name: "token", required: true, description: "Token de verificação"})
    @Get("recovery-password")
    async verificaEmailTrocaSenha(@Query('token') token: string, @Res() res: any, @Req() req: any) {
        await this.authService.verifyChangePasswordEmail(token).then((response) => {
            res.cookie('x-csrf-token', response.csrfToken,{httpOnly: false,
                                                  secure: false,       
                                                  sameSite: 'lax',
                                                  path:"/"})

            res.cookie('token', response.token,{httpOnly: true,
                                                secure:  true,
                                                sameSite: 'none',
                                                path:`/`})

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

        const csrfToken = req.cookies['x-csrf-token'] || req.headers['x-csrf-token'];

        return await this.authService.changePassword(novaSenha, req.user, csrfToken).then((response) => {
            console.log(response);
        }).catch((error) => {
           console.log(error);
        });
    }


    @Get("dados")
    @UseGuards(RefreshGuard) 
    pegarDados(@Req() req: any){
        return this.authService.pegarDados(req.user)
    }

    @ApiOperation({ summary: 'Atualiza dados do usuário' })
    @Put("update-user")
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: join(__dirname, "..", "..", "images", "profile").replace("dist", "src"),
            filename: (req, file, cb) => {
                const randomPart = Math.round(Math.random() * 1E12).toString().slice(-10);
                const uniqueSuffix = req.user.sub + "-" + Date.now() + '-' + randomPart;
                const extension = extname(file.originalname);

                const fileName = `${uniqueSuffix}`;
                const filePath = join(__dirname, "..", "..", "images", "profile", fileName).replace("dist", "src");
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
    @UseGuards(RefreshGuard)
    atualizarUsuario(@Body() body: any, @Req() req: any, @Res() res: Response){
        return this.authService.updateUser(body, req.file.filename, req.user.sub);
    }
}