import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CriarGereneteDTO } from './dto/create.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("singin")
    async createGerente(@Body() gerente: CriarGereneteDTO) {
        return await this.authService.singIn(gerente);
    }

    @Post("login")
    async login(@Body() user: LoginDTO) {
        return await this.authService.login(user)
    }


    @Get("verify")
    async verifyEmail(@Query('token') token: string) {
        console.log(token)

        return await this.authService.verifyEmail(token);

    }

}
