import { IsString, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPassword {

    @ApiProperty({
        description: "nova senha do usuario",
        example: "Novasenha123%"
    })
    @IsString({
        message: "senha deve ser uma string"
    })
    @IsNotEmpty({
        message: "senha não pode ser vazio"
    })
    senha: string
}