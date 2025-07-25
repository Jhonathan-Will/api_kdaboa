import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AlteraEnderecoDTO {

    @ApiProperty({
        description: 'Logradouro do endereço',
        example: 'Rua Exemplo',
    })
    @IsOptional()
    @IsString({ message: 'Logradouro deve ser uma string' })
    logradouro: string;

    @ApiProperty({
        description: 'Número do endereço',
        example: '123',
    })
    @IsOptional()
    @IsString({ message: 'Número deve ser uma string' })
    numero: string;

    @ApiProperty({
        description: 'Complemento do endereço',
        example: 'Apto 456',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Complemento deve ser uma string' })
    complemento?: string;

    @ApiProperty({
        description: 'Bairro do endereço',
        example: 'Centro',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Bairro deve ser uma string' })
    bairro: string;

    @ApiProperty({
        description: 'Cidade do endereço',
        example: 'São Paulo',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Cidade deve ser uma string' })
    cidade: string;

    @ApiProperty({
        description: 'Estado do endereço',
        example: 'SP',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Estado deve ser uma string' })
    estado: string;

    @ApiProperty({
        description: 'Indica se o endereço é favorito',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean({message: 'Deve ser verdaadeiro  ou  falso'})
    favorito: boolean;

    @ApiProperty({
        description: 'CEP do endereço',
        example: '12345-678',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'CEP deve ser uma string' })
    cep: string;
}