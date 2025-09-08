import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CriarEventoDTO {

    @ApiProperty({
        description: 'Nome do evento',
        example: 'Festa de Aniversário'
    })
    @IsString({ message: 'Nome deve ser uma string' })
    @IsNotEmpty({ message: 'Nome não pode ser vazio' })
    nome: string;

    @ApiProperty({
        description: 'Descrição do evento',
        example: 'Uma festa incrível para celebrar meu aniversário'
    })
    @IsString({ message: 'Descrição deve ser uma string' })
    @IsNotEmpty({ message: 'Descrição não pode ser vazia' })
    descricao: string;

    @ApiProperty({
        description: 'Data de início do evento',
        example: '2023-10-15T18:00:00Z'
    })
    @IsNotEmpty({ message: 'Data de início não pode ser vazia' })
    data_inicio: Date;

    @ApiProperty({
        description: 'Data de fim do evento',
        example: '2023-10-15T23:59:59Z'
    })
    @IsNotEmpty({ message: 'Data de fim não pode ser vazia' })
    data_fim: Date;

    @ApiProperty({
        description: 'ID do estabelecimento onde o evento será realizado',
        example: 1
    })
    @IsNotEmpty({ message: 'ID do endereço não pode ser vazio' })
    @IsNumber({}, { message: 'ID do endereço deve ser um número' })
    @Type(() => Number)
    id_endereco: number;

    @ApiProperty({
    description: 'Categoria do evento, representada por um array de números',
    example: [1, 2, 3],
    type: [Number]
    })
    @IsArray({ message: 'Categoria deve ser um array' })
    @IsNotEmpty({ message: 'Categoria não pode ser vazia' })
    @IsNumber({}, { each: true, message: 'Categoria deve ser um array de números' })
    @Transform(({ value }) => {
    if (Array.isArray(value)) {
        return value.map((v) => Number(v));
    }
    if (typeof value === 'string') {
        if (value.includes(',')) {
        return value.split(',').map((v) => Number(v.trim()));
        }
        return [Number(value)];
    }
    return [];
    })
    categoria: number[];
}