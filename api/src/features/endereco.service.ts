import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AlteraEnderecoDTO } from "src/users/gerente/dto/alteraEndereco.dto";
import { CriarEnderecoDTO } from "src/users/gerente/dto/criarEndreço.dto";

@Injectable()
export class EnderecoService {
    constructor(private prisma: PrismaService) {}

    async cadastrarEndereco(data: CriarEnderecoDTO, id_est: number, user_tipo: string) {
        if(user_tipo === 'Gerente'){                                        

            return await this.prisma.endereco.create({
                data: {
                    logradouro: data.logradouro,
                    numero: data.numero,
                    bairro: data.bairro,
                    cidade: data.cidade,
                    estado: data.estado,
                    cep: data.cep,
                    complemento: data.complemento,
                    favorito: false,
                    Estabelecimento_Endereco: {
                        create: {
                            id_estabelecimento: id_est
                        }
                    }
                }
            })
        }
    }

    async encontrarEnderecoPorEstabelecimento(id_estabelecimento: number) {
        return this.prisma.endereco.findMany({
            where: {
                Estabelecimento_Endereco: {
                    some: {
                        id_estabelecimento: id_estabelecimento
                    }
                }
            },
            include: {
                Estabelecimento_Endereco: true
            }
        })
    }

    async alteraEndereco(data: AlteraEnderecoDTO, addressId: number, estabelecimentoId: number) {

        const updateData: any = {
            ...(data.logradouro && { logradouro: data.logradouro }),
            ...(data.numero && { numero: data.numero }),
            ...(data.bairro && { bairro: data.bairro }),
            ...(data.cidade && { cidade: data.cidade }),
            ...(data.estado && { estado: data.estado }),
            ...(data.cep && { cep: data.cep }),
            ...(data.complemento && { complemento: data.complemento }),
            ...(data.favorito !== undefined && { favorito: data.favorito }),
        };

        if(updateData.favorito == true){await this.limpaFavorito(estabelecimentoId)}
        return await this.prisma.endereco.update({
            where: { id_endereco: addressId },
            data: updateData,
        });
    }
    

    async limpaFavorito(estabelecimentoId) {
        await this.prisma.endereco.updateMany({
            where: {favorito: true,
                    Estabelecimento_Endereco: {
                        some: {
                            id_estabelecimento: estabelecimentoId
                        }
                    }},
            data: {favorito: false}
        }).then(response => {console.log(response)}).catch(error => {
            console.log(error)
        })
    }

    async deletaEndereco(id: number) {
        return this.prisma.endereco.delete({
            where: { id_endereco: id }
        });
    }
}