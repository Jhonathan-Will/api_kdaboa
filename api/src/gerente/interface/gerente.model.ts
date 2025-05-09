import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CriarGereneteDTO } from "../../auth/dto/create.dto";

@Injectable()
export class GerenteModel {
    constructor(private prisma: PrismaService) {}

    async criarGerente(gerente: CriarGereneteDTO) {
        return await this.prisma.usuario.create({
            data: {
                nome_usuario: gerente.nome,
                email: gerente.email,
                senha: gerente.senha,
                tipo: "Gerente",
            },
        });
    }

    async verificaExisteGerente(email: string) {
        return await this.prisma.usuario.findFirst({
            where: {
                email: email,
                tipo: "Gerente",
            },
        })
    }
}