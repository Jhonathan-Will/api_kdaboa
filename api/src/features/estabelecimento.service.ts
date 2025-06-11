import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AlteraEstabelecimentoDTO } from "src/users/gerente/dto/alteraEstabelecimento.dto";
import { CriarEstabelecimentoDTO } from "src/users/gerente/dto/criarEstabelecimento.dto";

@Injectable()
export class EstabelecimentoService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async criaEstabelecimento(data: CriarEstabelecimentoDTO, userType: string) {
        if (userType === 'Gerente') {
            return this.prisma.estabelecimento.create({
                data: {
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
            });
        } else {
            throw new Error('Tipo de usuário não autorizado para criar estabelecimento');
        }
    }

    async alteraEstabelecimento(id: number, data: AlteraEstabelecimentoDTO) {
        const updateData: any = {
            ...(data.nome && { nome: data.nome }),
            ...(data.descricao &&  {descricao: data.descricao}),
            ...(data.categoria && {Estabelecimento_Categoria: {
                deleteMany: {},
                createMany: {
                    data: data.categoria.map((categoriaId: number) => ({ id_categoria: categoriaId }))
                }
            }}) 
        };

        return this.prisma.estabelecimento.update({
            where: { id_estabelecimento: id },
            data: updateData,
            include: {
                Estabelecimento_Categoria: true
            }
        });
    }

    async deletaEstabelecimento(id_estabelecimento: number) {
        return this.prisma.estabelecimento.delete({
            where: { id_estabelecimento }
        });
    }
}