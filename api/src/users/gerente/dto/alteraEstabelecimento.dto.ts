import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class AlteraEstabelecimentoDTO {
    @ApiProperty({
        description: 'ID do estabelecimento',
        example: 1
    })
    @IsNumber({}, {message: 'ID deve ser um número'})
    @IsNotEmpty({message: 'ID não pode ser vazio'})
    @Type(() => Number)
    id: number;

    @ApiPropertyOptional({
        description: 'Nome fantasia do estabelecimento',
        example: 'NeonRest Bar'
    })
    @IsOptional()
    @IsString({message: 'nome deve ser um string'})
    nome: string;

    @ApiPropertyOptional({
        description: 'Descrição do estabelecimento',
        example: 'xxxxxxxxxxx'
    })
    @IsOptional()
    @IsString({ message: 'Descrição deve ser um string' })
    descricao: string;

    @ApiPropertyOptional({
        description: 'Categorias do estabelecimento',
        example: [1, 4, 5]
    })
    @IsOptional()
    @IsArray({ message: 'Categoria devem ser estar em um array' })
    @IsNumber({}, { each: true, message: 'Categorias devem ser numero' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
        return value.split(',').map((v) => Number(v.trim()));
        }
        return value;
    })
    categoria: Array<number>;

    @ApiPropertyOptional({
        description: 'Nome do arquivo que deve ser salvo no banco',
        example: "1-11837381831371-19172819217.png",
    })
    @IsOptional()
    @IsString({
        message: 'Imagem deve ser um string'
    })
    imagem: string;
}