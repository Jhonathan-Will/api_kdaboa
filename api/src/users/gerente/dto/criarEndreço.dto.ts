import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CriarEnderecoDTO {
    @ApiProperty({
        description: 'Logradouro do endereço',
        example: 'Rua Exemplo',
    })
    @IsString({ message: 'Logradouro deve ser uma string' })
    @IsNotEmpty({ message: 'Logradouro é obrigatório' })
    logradouro: string;

    @ApiProperty({
        description: 'Número do endereço',
        example: '123',
    })
    @IsString({ message: 'Número deve ser uma string' })
    @IsNotEmpty({ message: 'Número é obrigatório' })
    numero: string;

    @ApiProperty({
        description: 'Complemento do endereço',
        example: 'Apto 456',
        required: false,
    })
    @IsString({ message: 'Complemento deve ser uma string' })
    @IsOptional()
    complemento?: string;

    @ApiProperty({
        description: 'Bairro do endereço',
        example: 'Centro',
    })
    @IsString({ message: 'Bairro deve ser uma string' })
    @IsNotEmpty({ message: 'Bairro é obrigatório' })
    bairro: string;

    @ApiProperty({
        description: 'Cidade do endereço',
        example: 'São Paulo',
    })
    @IsString({ message: 'Cidade deve ser uma string' })
    @IsNotEmpty({ message: 'Cidade é obrigatória' })
    cidade: string;

    @ApiProperty({
        description: 'Estado do endereço',
        example: 'SP',
    })
    @IsString({ message: 'Estado deve ser uma string' })
    @IsNotEmpty({ message: 'Estado é obrigatório' })
    estado: string;

    @ApiProperty({
        description: 'CEP do endereço',
        example: '12345678',
    })
    @IsString({ message: 'CEP deve ser uma string' })
    @IsNotEmpty({ message: 'CEP é obrigatório' })
    cep: string;
}