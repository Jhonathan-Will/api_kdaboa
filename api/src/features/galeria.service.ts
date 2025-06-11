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
}