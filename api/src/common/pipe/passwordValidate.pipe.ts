import { ArgumentMetadata, HttpException, Injectable, PipeTransform } from "@nestjs/common";
import { CriarGereneteDTO } from "src/auth/dto/create.dto";

@Injectable()
export class PasswordValidatePipe implements PipeTransform{
    transform(user: CriarGereneteDTO, metadata: ArgumentMetadata) {
        const minLength = 8;
        const requirements = [/[A-Z]/, /[!@#$%&*+=]/, /[0-9]/, /[a-z]/]

        if(user.senha.length < minLength) throw new HttpException('Senha não atinge requisitos mínimos', 400);

        for(const requirement of requirements){
            if(!requirement.test(user.senha)){
                throw new HttpException('Senha não atinge requisitos mínimos', 400);
            }
        }

        return user;
    }
}