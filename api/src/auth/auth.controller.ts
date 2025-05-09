import { Body, Controller, Post } from '@nestjs/common';
import { CriarGereneteDTO } from './dto/create.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post()
    async createGerente(@Body() gerente: CriarGereneteDTO) {
        return await this.authService.singIn(gerente);
    }

}
