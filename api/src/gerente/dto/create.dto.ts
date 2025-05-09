import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarGereneteDTO {
    @ApiProperty({
        description: "Nome do gerente",
        example: "Teste da Silva",
    })
    @IsNotEmpty({
        message: "Nome não pode ser vazio"
    })
    @IsString({
        message: "Nome deve ser uma string"
    })
    nome: string;

    @ApiProperty({
        description: "Email do gerente",
        example: "teste@gmai.com"
    })
    @IsNotEmpty({
        message: "Email não pode ser vazio"
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: "Senha do gerente",
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
