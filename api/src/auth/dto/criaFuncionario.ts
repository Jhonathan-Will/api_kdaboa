import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail } from "class-validator";

export class CriaFunctionarioDTO {

    @ApiProperty({
        description:"Nome do funcionário",
        example: "João da Silva",
    })
    @IsString({message: 'Nome deve ser uma string'})
    nome: string;

    @ApiProperty({
        description:"email do funcionário",
        example: "teste@email.com",
    })
    @IsEmail({}, { message: 'email deve ser uma string' })
    email: string;
}