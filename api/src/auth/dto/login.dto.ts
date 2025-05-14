import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class  LoginDTO {

    @ApiProperty({
        description: 'Email do usuário',
        example: "teste@gmail.com"
    })
    @IsNotEmpty({
        message: "Email não pode ser vazio"
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Senha do usuário',
        example: "Teste@2025"
    })
    @IsNotEmpty({
        message: "Senha não pode ser vazio"
    })
    @IsString({
        message: "Senha deve ser uma string"
    })
    senha: string;
}