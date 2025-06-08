import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { EnderecoService } from "./endereco.service";
import { EstabelecimentoService } from "./estabelecimento.service";


@Module({
    imports: [],
    providers: [PrismaService, EnderecoService, EstabelecimentoService],
    exports: [EnderecoService, EstabelecimentoService],
})
export class FeatureModule {}