import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { EnderecoService } from "./endereco.service";
import { EstabelecimentoService } from "./estabelecimento.service";
import { GaleriaService } from "./galeria.service";
import { ContatoService } from "./contato.service";
import { EventoService } from "./evento.service";


@Module({
    imports: [],
    providers: [PrismaService, EnderecoService, EstabelecimentoService, GaleriaService, ContatoService, EventoService],
    exports: [EnderecoService, EstabelecimentoService, GaleriaService, ContatoService, EventoService],
})
export class FeatureModule {}