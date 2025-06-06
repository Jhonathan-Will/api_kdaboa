import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CriarGereneteDTO } from "../../../auth/dto/create.dto";
import { GerenteDTO } from "../dto/gerente.dto";
import { CriarEstabelecimentoDTO } from "../dto/criarEstabelecimento.dto";
@Injectable()
export class GerenteModel {
    constructor(private prisma: PrismaService) {}

    async criarGerente(gerente: CriarGereneteDTO, status: number) {
        return await this.prisma.usuario.create({
            data: {
                nome_usuario: gerente.nome,
                email: gerente.email,
                senha: gerente.senha,
                tipo: "Gerente",
                status: status,
            },
        });
    }

    async verificaExistencia(email: string) {
        return await this.prisma.usuario.findFirst({
            where: {
                email: email,
                tipo: "Gerente",
            },
        })
    }

    async atualizaGerente(id: number, mudanca: any): Promise<GerenteDTO> {
         await this.prisma.usuario.update({
            where: {
                id_usuario: id,
            },
            data: mudanca
        }).then((response) => {
            console.log("Gerente atualizado com sucesso", response);
        }).catch((error) => {
            console.error("Erro ao atualizar gerente", error);
            throw new Error("Erro ao atualizar gerente");
        });

        const gerente = await this.prisma.usuario.findFirst({
            where: {
                id_usuario: id,
            },
        });

        if (!gerente) {
            throw new Error(`Gerente with id ${id} not found`);
        }

        return gerente;
    }

    async criarEstabelecimento(data: CriarEstabelecimentoDTO) {
        return await this.prisma.estabelecimento.create({
            data:{
                nome: data.nome,
                cnpj: data.cnpj,
                descricao: data.descricao,
                Estabelecimento_Categoria: {
                    createMany: {
                        data: data.categoria.map((categoriaId: number) => ({ id_categoria: categoriaId }))
                    }
                }
            },
            include: {
                Estabelecimento_Categoria: true
            }
        })
    }
}