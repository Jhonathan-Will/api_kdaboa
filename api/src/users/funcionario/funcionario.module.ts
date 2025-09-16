import { Module } from "@nestjs/common";
import { UsersModule } from "../users.module";
import { CsrfModule } from "src/security/csrf/csrf.module";
import { FeatureModule } from "src/features/features.module";
import { FuncionarioController } from "./funcionario.controller";
import { FuncionarioService } from "./funcionario.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "../users.service";

@Module({
    imports: [CsrfModule, UsersModule, FeatureModule],
    controllers: [FuncionarioController],
    providers: [FuncionarioService, PrismaService, UsersService]
})
export class FuncionarioModule {}