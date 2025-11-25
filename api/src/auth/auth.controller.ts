import { Body, Controller, Get, HttpStatus, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { CriarGereneteDTO } from './dto/create.dto';
import { AuthService } from './auth.service';
import { CsrfService } from 'src/security/csrf/csrf.service';
import { LoginDTO } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ChangeSenhaDTO } from './dto/change-senha.dto';
import { NewPassword } from './dto/new-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefreshGuard } from 'src/security/jwt/guard/refresh.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CriaFunctionarioDTO } from './dto/criaFuncionario';
import { ImageHandlePipe } from 'src/common/pipe/imageHandle.pipe';
import { PasswordValidatePipe } from 'src/common/pipe/passwordValidate.pipe';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
                private readonly csrf: CsrfService
    ) {}

    //Rotas de Cadastro e Login
    @ApiOperation({ summary: 'Cadastra gerente' })
    @ApiResponse({ status: 201, description: 'Gerente cadastrado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Gerente já existe ou domínio de e-mail não permitido.' })
    @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
    @ApiBody({ type: CriarGereneteDTO })
    @Post("singin")
    async createGerente(@Body( new PasswordValidatePipe() ) gerente: CriarGereneteDTO) {
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

            if(!response.isManager && response.type === Number(process.env.STATUS_CRIADO)) {
                res.status(HttpStatus.FOUND).json({redirect : `${process.env.FRONTEND_URL}/alterar-senha`})
            }else{
                res.send({message: 'login feito com sucesso'})
            }
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

    @UseGuards(RefreshGuard)
    @ApiOperation({summary: 'Rota para cadastrar funcionário'})
    @Post('/employee')
    async CadastraFuncionario(@Body() funcionario: CriaFunctionarioDTO, @Res() res: Response, @Req() req: any) {
        if (this.csrf.validateToken(req.cookies['x-csrf-token'] || req.headers['x-csrf-token'])) {
            res.status(HttpStatus.OK).json(await this.authService.cadastraFuncionario(funcionario, req.user.sub))
        }
    }

    @Get("dados")
    @UseGuards(RefreshGuard) 
    pegarDados(@Req() req: any){
        return this.authService.pegarDados(req.user.sub)
    }

    @ApiOperation({ summary: 'Atualiza dados do usuário' })
    @Put("update-user")
    @UseInterceptors(FileInterceptor('image'))
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
                nome: {
                    type: 'string',
                    example: 'Nome do usuário'
                },
            }, 
        },
    })
    @ApiConsumes('multipart/form-data')
    @UseGuards(RefreshGuard)
    atualizarUsuario(@Body() body: any, @Req() req: any, @Res() res: Response, @UploadedFile( new ImageHandlePipe('profile', false) ) file: Express.Multer.File){
        return res.status(HttpStatus.OK).json(this.authService.updateUser(body, file.filename, req.user.sub));
    }
}