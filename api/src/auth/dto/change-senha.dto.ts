import { IsEmail, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeSenhaDTO {

    @ApiProperty({
        description: "Email do usuário",
        example: "teste@gmail.com"
    })
    @IsNotEmpty({
        message: "Email não pode ser vazio"
    })
    @IsEmail()
    email: string;
}