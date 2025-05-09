import { Injectable, HttpException } from "@nestjs/common";
import { GerenteModel } from "./interface/gerente.model";
import { CriarGereneteDTO } from "./dto/create.dto";

@Injectable()
export class GerenteService {
    
    constructor(private readonly gerenteModel: GerenteModel) {}

    async criarGerente(gerente: CriarGereneteDTO) {
        const user = await this.gerenteModel.verificaExisteGerente(gerente.email);

        if(user) {
            throw new HttpException({
                status: 400,
                error: "Gerente já existe",
            }, 400);
        }

        return await this.gerenteModel.criarGerente(gerente);
    }

}