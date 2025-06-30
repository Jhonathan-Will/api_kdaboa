import { HttpException, Injectable } from "@nestjs/common";
import { join } from "path";
import * as fs from 'fs';

@Injectable()
export class AppService {
    constructor () {}

    //rota para buscar foto da galeria
    async buscaFotoGaleria(name: string): Promise<string> {
        const path = join(__dirname, "images","gallery", name).replace("dist", "src");
        
        if(!fs.existsSync(path)) throw new HttpException('Imagem não encontrada', 404)
        
        return path
    }

    async buscaFotoEvento(name: string): Promise<string> {
        const path = join(__dirname, "images","event", name).replace("dist", "src");

        if(!fs.existsSync(path)) throw new HttpException('Imagem não encontrada', 404)

        return path
    }
}