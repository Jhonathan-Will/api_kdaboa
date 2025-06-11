import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlteraEstabelecimentoDTO {
    @ApiProperty({
        description: 'ID do estabelecimento',
        example: 1
    })
    @IsNumber({}, {message: 'ID deve ser um número'})
    @IsNotEmpty({message: 'ID não pode ser vazio'})
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
    categoria: Array<number>;
}