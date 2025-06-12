import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GaleriaService {
    constructor(private prisma: PrismaService) {}

    async adicionaFotoGaleria(id: number, file: string) {

        await this.prisma.galeria.create({
            data: {
                foto: file,
                id_estabelecimento: id,
            }
        }).then((response) => {
            return response;
        }
        ).catch((error) => {
            console.error("Erro ao adicionar foto à galeria:", error);
            throw new Error("Erro ao adicionar foto à galeria");
        }
        );
    }

    async encontraFotoPorEstabelecimento(id: number){
        return await this.prisma.galeria.findMany({
            where: {
                id_estabelecimento: id
            }
        })
    }

    async deletaGaleria(id:number) {
        return await this.prisma.galeria.delete({
            where:{
                id_gal: id
            }
        })
    }
}