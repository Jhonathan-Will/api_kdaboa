import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { EnderecoService } from "./endereco.service";
import { EstabelecimentoService } from "./estabelecimento.service";
import { GaleriaService } from "./galeria.service";


@Module({
    imports: [],
    providers: [PrismaService, EnderecoService, EstabelecimentoService, GaleriaService],
    exports: [EnderecoService, EstabelecimentoService, GaleriaService],
})
export class FeatureModule {}