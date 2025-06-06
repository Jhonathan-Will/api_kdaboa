import { Module } from '@nestjs/common';
import { GerenteController } from './gerente.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GerenteService } from './gerente.service';
import { GerenteModel } from './interface/gerente.model';
import { CsrfModule } from 'src/security/csrf/csrf.module';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';

@Module({
  imports: [CsrfModule, UsersModule],
  controllers: [GerenteController],
  providers: [PrismaService, GerenteService, GerenteModel, UsersService],
  exports: [GerenteModel]
})
export class GerenteModule {}
