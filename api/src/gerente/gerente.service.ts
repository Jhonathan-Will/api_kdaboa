import { Injectable } from "@nestjs/common";
import { GerenteModel } from "./interface/gerente.model";
import { CriarGereneteDTO } from "./dto/create.dto";
@Injectable()
export class GerenteService {
    constructor(private readonly gerenteModel: GerenteModel) {}

    async criarGerente(gerente: CriarGereneteDTO) {
        return await this.gerenteModel.criarGerente(gerente);
    }

}