import { Module } from '@nestjs/common';
import { GerenteController } from './gerente.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GerenteService } from './gerente.service';
import { CsrfModule } from 'src/security/csrf/csrf.module';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';
import { FeatureModule } from 'src/features/features.module';

@Module({
  imports: [CsrfModule, UsersModule, FeatureModule],
  controllers: [GerenteController],
  providers: [PrismaService, GerenteService, UsersService],
  exports: []
})
export class GerenteModule {}
