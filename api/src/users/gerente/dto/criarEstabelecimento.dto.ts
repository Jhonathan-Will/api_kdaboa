import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarEstabelecimentoDTO {

    @ApiProperty({
        description: 'Nome fantasia do estabelecimento',
        example: 'NeonRest Bar'
    })
    @IsString({
        message: 'nome deve ser um string'
    })
    @IsNotEmpty({
        message: 'nome não pode ser vazio'
    })
    nome: string;

    @ApiProperty({
        description: 'CNPJ do estabelecimento',
        example: 'xxxxxxxxxxx'
    })
    @IsString({
        message: 'CNPJ deve ser um string'
    })
    @IsNotEmpty({
        message: 'CNPJ não pode ser vazio'
    })
    cnpj: string;

    @ApiProperty({
        description: 'Descrição do estabelecimento',
        example: 'Estabelecimento de teste para ciração e inserção de dados na tabela de estabelecimentos'
    })
    @IsString({
        message: 'Descrição deve ser um string'
    })
    @IsNotEmpty({
        message: 'Descrição não pode ser vazio'
    })
    descricao: string;

    @ApiProperty({
        description: 'Categorias do estabelecimento',
        example: [1, 4, 5]
    })
    @IsArray({
        message: 'Categoria devem ser estar em um array'
    })
    @IsNumber({}, { each: true, message: 'Categorias devem ser numero' })
    @IsNotEmpty({
        message: 'Categorias não podem ser vazio'
    })
    categoria: Array<number>;
}