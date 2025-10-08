import { HttpException, Injectable } from "@nestjs/common";
import { join } from "path";
import * as fs from 'fs';

import { EventoService } from 'src/features/evento.service'
import { EstabelecimentoService } from "./features/estabelecimento.service";

@Injectable()
export class AppService {
    constructor(private readonly eventoService: EventoService,
                private readonly estabelecimentoService: EstabelecimentoService
    ) { }

    //rota para buscar foto do usuario
    async buscaFotoUsuario(name: string): Promise<string> {
        const path = join(__dirname, "images", "profile", name).replace("dist", "src");

        if (!fs.existsSync(path)) throw new HttpException('Imagem não encontrada', 404);

        return path
    }

    //rota para buscar foto do estbalecimento
    async buscaFotoEstabelcimento(name: string): Promise<string> {
        const path = join(__dirname, "images", "establishment", name).replace("dist", "src");

        if (!fs.existsSync(path)) throw new HttpException('Imagem não encontrada', 404);

        return path
    }

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
        const evento = await this.eventoService.buscaEventoPorId(id);

        if (!evento) return null
        evento.foto = `http://localhost:3000/event/image/${evento.foto}`
        evento.Estabelecimento.imagem = `http://localhost:3000/establishment/image/${evento?.Estabelecimento.imagem}`

        return evento
    }

    async filtraEvento(filtros: { name?: string; category?: number[]; city?: string, date?: Date }) {
        if(!filtros.name && (!filtros.category || filtros.category.length == 0) && !filtros.city && !filtros.date){
            const eventos = await this.eventoService.buscaTodosEventos()
            return eventos.map(evento => ({
                ...evento,
                foto: `http://localhost:3000/event/image/${evento.foto}`,
                Estabelecimento: {
                    ...evento.Estabelecimento,
                    imagem: `http://localhost:3000/establishment/image/${evento?.Estabelecimento.imagem}`
                }
            }))
        }
        const eventos = await this.eventoService.buscaEventosFiltrados(filtros)
            return eventos.map(evento => ({
                ...evento,
                foto: `http://localhost:3000/event/image/${evento.foto}`,
                Estabelecimento: {
                    ...evento.Estabelecimento,
                    imagem: `http://localhost:3000/establishment/image/${evento?.Estabelecimento.imagem}`
                }
            }))
    }

    async buscaEstabelecimento(id: number) {
        const estabelecimento = await this.estabelecimentoService.buscaEstabelecimento(id)

        if ( !estabelecimento?.Galeria) return estabelecimento

        if (Array.isArray(estabelecimento.Galeria)) {
            return {
                ...estabelecimento,
                imagem: `http://localhost:3000/establishment/image/${estabelecimento.imagem}`,
                Galeria: estabelecimento.Galeria.map(gal => ({
                    ...gal,
                    foto: `http://localhost:3000/gallery/${gal.foto}`
                }))
            }
        } 
    }
}