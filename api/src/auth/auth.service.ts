import { HttpException, Injectable } from '@nestjs/common';
import { GerenteModel } from 'src/gerente/interface/gerente.model';
import { CriarGereneteDTO } from './dto/create.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import * as bcrypt from 'bcrypt';
import { ChangeSenhaDTO } from './dto/change-senha.dto';
import { NewPassword } from './dto/new-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private gerenteModel: GerenteModel,
        private readonly jwtService: JwtService,
        private readonly email: EmailService
    ) {}

    async singIn(gerente: CriarGereneteDTO) {
        if (this.verificaDominio(gerente.email)) {
            throw new HttpException(
                { status: 400, error: 'Domínio de e-mail não permitido' },
                400,
            );
        }

        const verify = await this.gerenteModel.verificaExistencia(gerente.email);
        if (verify) {
            throw new HttpException(
                { status: 400, error: 'Gerente já existe' },
                400,
            );
        }

        const statusCriado = Number(process.env.STATUS_CRIADO);
        if (isNaN(statusCriado)) {
            throw new HttpException(
                { status: 500, error: 'STATUS_CRIADO não está definido ou não é um número válido' },
                500,
            );
        }

        const payload = { email: gerente.email, status: statusCriado };
        const token = this.jwtService.sign(payload, { expiresIn: '1h' });

        try {
            await this.email.sendVerificationEmail(gerente.email, token, gerente.nome);
        } catch (err) {
            console.log('erro ao enviar email', err);
            throw new HttpException(
                { status: 500, error: 'Erro ao enviar email' },
                500,
            );
        }

        const sal = await bcrypt.genSalt(10);
        gerente.senha = await bcrypt.hash(gerente.senha, sal);

        await this.gerenteModel.criarGerente(gerente, statusCriado);

        return { message: 'Verifique seu e-mail' };
    }

    async verifyEmail(token: string) {
        const decodificado = this.jwtService.verify(token);
        const usuario = await this.gerenteModel.verificaExistencia(decodificado.email);

        const statusVerificado = Number(process.env.STATUS_VERIFICADO);
        const statusCriado = Number(process.env.STATUS_CRIADO);

        if (isNaN(statusVerificado) || isNaN(statusCriado)) {
            throw new HttpException(
                { status: 500, error: "STATUS não está definido ou não é um número válido" },
                500,
            );
        }

        if (usuario) {
            if (usuario.status === statusVerificado && decodificado.status !== statusCriado) {
                throw new HttpException(
                    { status: 400, error: "Email já verificado" },
                    400,
                );
            }

            const novoUsuario = await this.gerenteModel.atualizaGerente(usuario.id_usuario, { status: statusVerificado });
            const payload = {
                email: novoUsuario.email,
                sub: novoUsuario.id_usuario,
                status: novoUsuario.status,
                tipo: novoUsuario.tipo
            };
            const token = this.jwtService.sign(payload, { expiresIn: '1h' });
            return { message: 'Email verificado com sucesso', token };
        }

        throw new HttpException(
            { status: 400, error: "Email não encontrado" },
            400,
        );
    }

    async login(user: LoginDTO) {
        const response = await this.gerenteModel.verificaExistencia(user.email);

        if (response) {
            if (bcrypt.compareSync(user.senha, response.senha)) {
                const payload = {
                    email: response.email,
                    sub: response.id_usuario,
                    status: response.status,
                    tipo: response.tipo
                };
                return {
                    access_token: this.jwtService.sign(payload),
                };
            } else {
                throw new HttpException(
                    { status: 400, error: "credenciais invalidas" },
                    400,
                );
            }
        }

        throw new HttpException(
            { status: 400, error: "credenciais invalidas" },
            400,
        );
    }

    async sendChangePasswordEmail(email: ChangeSenhaDTO) {
        const usuario = await this.gerenteModel.verificaExistencia(email.email);

        if (usuario) {
            if (usuario.status === Number(process.env.STATUS_CRIADO)) {
                throw new HttpException(
                    { status: 400, error: "Email não verificado" },
                    400,
                );
            }

            const token = this.jwtService.sign(
                { email: usuario.email, id: usuario.id_estabelecimento, status: usuario.tipo },
                { expiresIn: '1h' }
            );
            try {
                await this.email.sendRecoveryPasswordEmail(usuario.email, token, usuario.nome_usuario);
            } catch (err) {
                console.log('erro ao enviar email', err);
                throw new HttpException(
                    { status: 500, error: 'Erro ao enviar email' },
                    500,
                );
            }
            return { message: 'Verifique seu e-mail' };
        }

        throw new HttpException(
            { status: 400, error: "Email não encontrado" },
            400,
        );
    }

    async verifyChangePasswordEmail(token: string) {
        const decodificado = this.jwtService.verify(token);
        const usuario = await this.gerenteModel.verificaExistencia(decodificado.email);

        if (usuario) {
            if (usuario.status === Number(process.env.STATUS_CRIADO)) {
                throw new HttpException(
                    { status: 400, error: "Email não verificado" },
                    400,
                );
            }
            const payload = {
                email: usuario.email,
                sub: usuario.id_usuario,
                status: usuario.status
            };
            
            const newToken = this.jwtService.sign(payload, { expiresIn: '1h' });

            return { message: 'Email verificado com sucesso', token: newToken };
        }


        throw new HttpException(
            { status: 400, error: "Email não encontrado" },
            400,
        );
    }

    async changePassword(novaSenha: NewPassword, user: any) {
        const usuario = await this.gerenteModel.verificaExistencia(user.email);

        if (usuario) {
            if (usuario.status === Number(process.env.STATUS_CRIADO)) {
                throw new HttpException(
                    { status: 400, error: "Email não verificado" },
                    400,
                );
            }

            const sal = await bcrypt.genSalt(10);
            const data = {senha: await bcrypt.hash(novaSenha.senha, sal)}

            await this.gerenteModel.atualizaGerente(usuario.id_usuario, data);

            return { message: 'Senha alterada com sucesso' };
        }

        throw new HttpException(
            { status: 400, error: "Usuário não encontrado" },
            400,
        );
    }

    private verificaDominio(email: string) {
        if (!process.env.ALLOWED_DOMAINS) {
            throw new HttpException(
                { status: 500, error: 'ALLOWED_DOMAINS não está definido nas variáveis de ambiente' },
                500,
            );
        }

        const dominiosPermitidos = process.env.ALLOWED_DOMAINS.split(',');
        const dominioEmail = email.split('@')[1]?.toLowerCase();

        return !dominiosPermitidos.includes(dominioEmail);
    }
}
