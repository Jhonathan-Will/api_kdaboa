import { Body, HttpException, Injectable } from '@nestjs/common';
import { GerenteModel } from 'src/gerente/interface/gerente.model';
import { CriarGereneteDTO } from './dto/create.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private gerenteModel: GerenteModel, 
                private readonly jwtService: JwtService) {}

    async singIn(gerente: CriarGereneteDTO) {
        const verify = await this.gerenteModel.verificaExisteGerente(gerente.email);

        if(verify) {
            throw new HttpException({
                status: 400,
                error: "Gerente já existe",
            }, 400);
        }

        const user = await this.gerenteModel.criarGerente(gerente);
        const payload = { email: user.email, sub: user.id_usuario };
        return {
            access_token: this.jwtService.sign(payload),
        }
    } 
}
