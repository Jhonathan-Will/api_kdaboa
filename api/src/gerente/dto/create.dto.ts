import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarGereneteDTO {
    @ApiProperty({
        description: "Nome do gerente",
        example: "Teste da Silva",
    })
    @IsNotEmpty()
    @IsString()
    nome: string;

    @ApiProperty({
        description: "Email do gerente",
        example: "teste@gmai.com"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: "Senha do gerente",
        example: "Teste@2025"
    })
    @IsNotEmpty()
    @IsString()
    senha: string;
}
