import { Module } from '@nestjs/common';
import { GerenteController } from './gerente.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GerenteService } from './gerente.service';
import { GerenteModel } from './interface/gerente.model';
import { CsrfModule } from 'src/security/csrf/csrf.module';

@Module({
  imports: [CsrfModule],
  controllers: [GerenteController],
  providers: [PrismaService, GerenteService, GerenteModel],
  exports: [GerenteModel]
})
export class GerenteModule {}
