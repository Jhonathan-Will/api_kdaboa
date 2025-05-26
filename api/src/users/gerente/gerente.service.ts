import { Injectable, HttpException } from "@nestjs/common";
import { GerenteModel } from "./interface/gerente.model";
import { CriarGereneteDTO } from "../../auth/dto/create.dto";

@Injectable()
export class GerenteService {
    
    constructor(private readonly gerenteModel: GerenteModel) {}

}