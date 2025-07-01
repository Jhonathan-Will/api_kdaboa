import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeletaGaleriaDTO {
    @ApiProperty({
        description: 'Nome da imagem a ser deletada',
        example: 'imagem1.jpg',
    })
    @IsString({ message: 'Nome deve ser uma string' })
    @IsNotEmpty({ message: 'Nome da imagem é obrigatório' })
    nome: string;
}
