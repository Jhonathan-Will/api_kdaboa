import { HttpException, Injectable } from '@nestjs/common';
import { GerenteModel } from 'src/gerente/interface/gerente.model';
import { CriarGereneteDTO } from './dto/create.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(private gerenteModel: GerenteModel, 
                private readonly jwtService: JwtService,
                private readonly email: EmailService) {}

    async singIn(gerente: CriarGereneteDTO) {
            if (!process.env.ALLOWED_DOMAINS) {
                throw new HttpException(
                    {
                        status: 500,
                        error: 'ALLOWED_DOMAINS não está definido nas variáveis de ambiente',
                    },
                    500,
                );
            }

            const dominiosPermitidos = process.env.ALLOWED_DOMAINS.split(',');
            const dominioEmail = gerente.email.split('@')[1]?.toLowerCase();

            if (!dominiosPermitidos.includes(dominioEmail)) {
                throw new HttpException(
                    {
                        status: 400,
                        error: 'Domínio de e-mail não permitido',
                    },
                    400,
                );
            }

            const verify = await this.gerenteModel.verificaExistencia(gerente.email);
            if (verify) {
                throw new HttpException(
                    {
                        status: 400,
                        error: 'Gerente já existe',
                    },
                    400,
                );
            }

            const statusCriado = Number(process.env.STATUS_CRIADO);
            if (isNaN(statusCriado)) {
                throw new HttpException(
                    {
                        status: 500,
                        error: 'STATUS_CRIADO não está definido ou não é um número válido',
                    },
                    500,
                );
            }

            const payload = { email: gerente.email, status: statusCriado };
            const token = await this.jwtService.sign(payload, { expiresIn: '1h' });

            try {
                await this.email.sendVerificationEmail(gerente.email, token);
            } catch (err) {
                console.log('erro ao enviar email', err);
                throw new HttpException(
                    {
                        status: 500,
                        error: 'Erro ao enviar email',
                    },
                    500,
                );
            }

            const sal = await bcrypt.genSalt(10);
            gerente.senha = await bcrypt.hash(gerente.senha, sal);

            await this.gerenteModel.criarGerente(gerente, statusCriado);

            return { message: 'Verifique seu e-mail' };
    }

    async verifyEmail(token: string) {
        try{
            const decodificado = this.jwtService.verify(token);
            const usuario = await this.gerenteModel.verificaExistencia(decodificado.email);
            const statusVerificado = Number(process.env.STATUS_VERIFICADO);
            const statusCriado = Number(process.env.STATUS_CRIADO);
            if (isNaN(statusVerificado) || isNaN(statusCriado)) {
                throw new HttpException({
                    status: 500,
                    error: "STATUS não está definido ou não é um número válido",
                }, 500);
            }

            if(usuario){
                if(usuario.status === statusVerificado && decodificado.status !== statusCriado){
                    throw new HttpException({
                        status: 400,
                        error: "Email já verificado",
                    }, 400);
                }
                const novoUsuario = await this.gerenteModel.atualizaGerente(usuario.id_usuario, statusVerificado);
                const payload = { email: novoUsuario.email, sub: novoUsuario.id_usuario, status: novoUsuario.status };
                const token = this.jwtService.sign( payload, { expiresIn: '1h' });
                return { message: 'Email verificado com sucesso', token};
            }
        }catch(e){

            console.log(e)
            
            throw new HttpException({
                status: 400,
                error: "Token inválido",
            }, 400);
        }
    }
    
    async login(user: LoginDTO) {
        const response = await this.gerenteModel.verificaExistencia(user.email);

        if(response){

            if (bcrypt.compareSync(user.senha, response.senha)) {
                const payload = { email: response.email, sub: response.id_usuario, status: response.status, tipo: response.tipo};
                return {
                    access_token: this.jwtService.sign(payload),
                };
            }  {
                throw new HttpException({
                    status: 400,
                    error: "credenciais invalidas",
                }, 400);
            }
        }

        throw new HttpException({
            status: 400,
            error: "credenciais invalidas",
        }, 400);
    }
}
