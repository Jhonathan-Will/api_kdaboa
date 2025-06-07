import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { EnderecoService } from "./endereco.service";


@Module({
    imports: [],
    providers: [PrismaService, EnderecoService],
    exports: [EnderecoService],
})
export class FeatureModule {}