import { HttpException, Injectable } from "@nestjs/common";
import { join } from "path";
import * as fs from 'fs';

import { EventoService } from 'src/features/evento.service'

@Injectable()
export class AppService {
    constructor(private readonly eventoService: EventoService) { }

    //rota para buscar foto da galeria
    async buscaFotoGaleria(name: string): Promise<string> {
        const path = join(__dirname, "images", "gallery", name).replace("dist", "src");

        if (!fs.existsSync(path)) throw new HttpException('Imagem não encontrada', 404)

        return path
    }

    async buscaFotoEvento(name: string): Promise<string> {
        const path = join(__dirname, "images", "events", name).replace("dist", "src");

        if (!fs.existsSync(path)) throw new HttpException('Imagem não encontrada', 404)

        return path
    }

    async buscaEvento(id: number) {
        return await this.eventoService.buscaEventoPorId(id)
    }

    async filtraEvento(filtros: { name?: string; category?: number[]; date?: string }) {
        if(!filtros.name && (!filtros.category || filtros.category.length == 0)&& !filtros.date){
            const eventos = await this.eventoService.buscaTodosEventos()
            return eventos.map(evento => ({
                ...evento,
                foto: `http://localhost:3000/event/image/${evento.foto}` 
            }))
        }
        const eventos = await this.eventoService.buscaEventosFiltrados(filtros)
            return eventos.map(evento => ({
                ...evento,
                foto: `http://localhost:3000/event/image/${evento.foto}` 
            }))
    }
}