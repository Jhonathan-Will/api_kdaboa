import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
         private readonly prismaService: PrismaService,
    ) {}

    async getAllUsers() {
        return await this.prismaService.usuario.findMany();
    }

    async getUserById(id: number) {
        return await this.prismaService.usuario.findUnique({
            where: { id_usuario: id },
        });
    }

    async createUser(data: any) {
        return await this.prismaService.usuario.create({
            data,
        });
    }

    async updateUser(id: number, data: any) {
        return await this.prismaService.usuario.update({
            where: { id_usuario: id },
            data,
        });
    }

    async deleteUser(id: number) {
        return await this.prismaService.usuario.delete({
            where: { id_usuario: id },
        });
    }

    async getUserByEmail(email: string) {
        return await this.prismaService.usuario.findUnique({
            where: { email },
        });
    }
}
