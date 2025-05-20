import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

@Module({
    imports: [],
    controllers: [],
    providers: [PrismaService, UsersService],
    exports: [UsersService]
})
export class UsersModule {}