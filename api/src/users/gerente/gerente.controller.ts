import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { GerenteService } from './gerente.service';

@Controller("gerente")
export class GerenteController {
    constructor(private readonly gerenteService: GerenteService) {}

    @Get()
    getGerente() {
        return "Gerente";
    }
}