import { HttpException, Injectable } from '@nestjs/common';
import { CriarGereneteDTO } from './dto/create.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { ChangeSenhaDTO } from './dto/change-senha.dto';
import { NewPassword } from './dto/new-password.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { CsrfService } from 'src/security/csrf/csrf.service';
import { CriaFunctionarioDTO } from './dto/criaFuncionario';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private readonly jwtService: JwtService,
        private csrf: CsrfService,
        private readonly email: EmailService,
    ) {}

    async singIn(gerente: CriarGereneteDTO) {
        if (this.verificaDominio(gerente.email)) {
            throw new HttpException(
                { status: 400, error: 'Domínio de e-mail não permitido' },
                400,
            );
        }

        const verify = await this.usersService.getUserByEmail(gerente.email);
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

        const payload = {email: gerente.email, status: statusCriado};
        const token = this.jwtService.sign(payload);

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

        await this.usersService.createUser({
                nome_usuario: gerente.nome,
                email: gerente.email,
                senha: gerente.senha,
                tipo: "Gerente",
                status: statusCriado,
            });

        return { message: 'Verifique seu e-mail' };
    }

    async verifyEmail(token: string) {
        const decodificado = this.jwtService.verify(token);
        const usuario = await this.usersService.getUserByEmail(decodificado.email);

        const statusVerificado = Number(process.env.STATUS_VERIFICADO);
        const statusCriado = Number(process.env.STATUS_CRIADO);

        if (isNaN(statusVerificado) || isNaN(statusCriado)) {
            throw new HttpException(
                { status: 500, error: "STATUS não está definido ou não é um número válido" },
                500,
            );
        }

        if (usuario) {
            if (usuario.status === statusVerificado && decodificado.status == statusCriado) {
                throw new HttpException(
                    { status: 400, error: "Email já verificado" },
                    400,
                );
            }

            await this.usersService.updateUser(usuario.id_usuario, { status: statusVerificado });
            return { message: 'Email verificado com sucesso'};
        }

        throw new HttpException(
            { status: 400, error: "Email não encontrado" },
            400,
        );
    }

    async login(user: LoginDTO) {
        const usuario = await this.usersService.getUserByEmail(user.email);

        if (usuario) {
            if (bcrypt.compareSync(user.senha, usuario.senha)) {
                const payload = {
                    email: usuario.email,
                    sub: usuario.id_usuario,
                    status: usuario.status,
                    tipo: usuario.tipo
                };
                const csrfToken = this.csrf.generateToken({sub: usuario.id_usuario, status: usuario.status, tipo: usuario.tipo})
                const refresh_token = {sub: usuario.id_usuario, status: usuario.status, email: usuario.email, tipo: usuario.tipo, secret: process.env.REFRESH_SECRET}
                return {
                    access_token: this.jwtService.sign(payload, {expiresIn: '1min'}),
                    csrfToken,
                    refresh_token: this.jwtService.sign(refresh_token)
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
        const usuario = await this.usersService.getUserByEmail(email.email);

        if (usuario) {
            if (usuario.status === Number(process.env.STATUS_CRIADO)) {
                throw new HttpException(
                    { status: 400, error: "Email não verificado" },
                    400,
                );
            }

            const token = this.jwtService.sign(
                { email: usuario.email, id: usuario.id_estabelecimento, status: usuario.tipo },
                { expiresIn: '10min' }
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
        const usuario = await this.usersService.getUserByEmail(decodificado.email);
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

            const newToken = this.jwtService.sign(payload, {expiresIn: '10min'});
            const csrfToken = this.csrf.generateToken({sub: usuario.id_usuario, status: usuario.status, tipo: usuario.tipo})
            return { message: 'Email verificado com sucesso', token: newToken, csrfToken};
        }


        throw new HttpException(
            { status: 400, error: "Email não encontrado" },
            400,
        );
    }

    async changePassword(novaSenha: NewPassword, user: any, csrfToken: string) {
        if(this.csrf.validateToken(csrfToken)){

            const usuario = await this.usersService.getUserByEmail(user.email);

            if (usuario) {
                if (usuario.status === Number(process.env.STATUS_CRIADO)) {
                    throw new HttpException(
                        { status: 400, error: "Email não verificado" },
                        400,
                    );
                }

                const sal = await bcrypt.genSalt(10);
                const data = {senha: await bcrypt.hash(novaSenha.senha, sal)}

                await this.usersService.updateUser(usuario.id_usuario, data);

                return { message: 'Senha alterada com sucesso' };
            }

            throw new HttpException(
                { status: 400, error: "Usuário não encontrado" },
                400,
            );
        }

        throw new HttpException(
            { status: 400, error: "Requisição invalida" },
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


    //rota para cadastrar funcionário
    async cadastraFuncionario(data: CriaFunctionarioDTO, userId: number) {
        const user = await this.usersService.getUserByEmail(data.email);
        const manager = await this.usersService.getUserById(userId);
        
        if(user) throw new HttpException('Usuário já cadastrado', 400);
        if(!manager || !manager.id_estabelecimento || manager.status != Number(process.env.STATUS_VERIFICADO)) throw new HttpException('Não foi possivel cadastrar seu novo funcionário', 400);

        const usersByEstablishment = await this.usersService.getUsersByEstablishment(manager.id_estabelecimento)

        console.log(usersByEstablishment)
        console.log(usersByEstablishment.length)
        if(usersByEstablishment.length >= Number(process.env.LIMITE_FUNCIONARIOS)) throw new HttpException('Limite de funcionários atingido', 400);

        const password = this.generateRandomPassword(10)

        await this.usersService.createUser({
            nome_usuario: data.nome,
            email: data.email,
            senha: password,
            tipo: 'Funcionario',
            id_estabelecimento: manager.id_estabelecimento,
            status: Number(process.env.STATUS_CRIADO)
        }).then( response => {
            try {
                this.email.sendNewEmployeeEmail(data.email, password, data.nome);
            }catch (error) {
                this.usersService.deleteUser(response.id_usuario);
                console.log(error)
                throw new HttpException('Erro ao enviar email para o novo funcionário', 500);
            }
            
            return response
        }).catch( error => {
            console.log(error)
            throw new HttpException('Erro ao cadastrar funcionário', 500);
        })
    }

    private generateRandomPassword(length: number): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
      let password = '';
      for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * chars.length);
          password += chars[randomIndex];
      }
      return password;
    }


    async pegarDados(token: string){
        return token
    }

}
