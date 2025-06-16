import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class ContatoDTO {

    @ApiProperty({
        description: 'Telefone celular principal do contato',
        example: '11999999999'
    })
    @IsOptional()
    @IsString({ message: 'Telefone deve ser uma string' })
    tel_cel_1: string;

    @ApiProperty({
        description: 'Telefone celular principal do contato',
        example: '11999999999'
    })
    @IsOptional()
    @IsString({ message: 'Telefone deve ser uma string' })
    tel_cel_2?: string;

    @ApiProperty({
        description: 'email principal do contato',
        example: 'teste@gmail.com'
    })
    @IsOptional()
    @IsString({ message: 'email deve ser uma string' })
    email: string;
}