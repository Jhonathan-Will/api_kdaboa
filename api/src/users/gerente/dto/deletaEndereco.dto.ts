import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DeletaEnderecoDTO {
    @ApiProperty({
        description: 'ID do endereço a ser deletado',
        example: 1,
    })
    @IsNumber({}, { message: 'ID deve ser um número' })
    @IsNotEmpty({ message: 'ID é obrigatório' })
    id: number;
}