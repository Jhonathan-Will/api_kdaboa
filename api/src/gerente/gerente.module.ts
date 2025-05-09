import { Module } from '@nestjs/common';
import { GerenteController } from './gerente.controller';
import { PrismaService } from '../prisma/prisma.service';
import { GerenteService } from './gerente.service';
import { GerenteModel } from './interface/gerente.model';

@Module({
  imports: [],
  controllers: [GerenteController],
  providers: [PrismaService, GerenteService, GerenteModel],
})
export class GerenteModule {}
