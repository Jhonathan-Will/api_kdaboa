import { Injectable, HttpException } from "@nestjs/common";
import { CriarEstabelecimentoDTO } from "./dto/criarEstabelecimento.dto";
import { UsersService } from "../users.service";
import { CriarEnderecoDTO } from "./dto/criarEndreço.dto";
import { CsrfService } from "src/security/csrf/csrf.service";
import { PrismaService } from "src/prisma/prisma.service";
import { EnderecoService } from "src/features/endereco.service";
import { EstabelecimentoService } from "src/features/estabelecimento.service";
import { GaleriaService } from "src/features/galeria.service";
import { AlteraEnderecoDTO } from "./dto/alteraEndereco.dto";
import * as fs from 'fs';
import { join } from "path";
import { ContatoService } from "src/features/contato.service";
import { CriarEventoDTO } from "./dto/criarEvento.dto";
import { EventoService } from "src/features/evento.service";
import { isNumber } from "class-validator";
import { EventoDTO } from "./dto/evento.dto";
@Injectable()
export class GerenteService {
    
    constructor(private readonly userService: UsersService,
                private readonly csrf: CsrfService,
                private readonly enderecoService: EnderecoService,
                private readonly estabelecimentoService: EstabelecimentoService,
                private readonly galeriaService: GaleriaService,
                private readonly contatoService: ContatoService,
                private readonly eventoService: EventoService) {}

    // Rota para criar estabelecimento
    async criarEstabelecimento(data: CriarEstabelecimentoDTO, id: number, userType: string): Promise<{ id_estabelecimento: number }> {
      try {
        const response = await this.estabelecimentoService.criaEstabelecimento(data, userType);

        try {
          await this.userService.updateUser(id, { id_estabelecimento: response.id_estabelecimento });
        } catch (error) {
          console.log(error);
          await this.estabelecimentoService.deletaEstabelecimento(response.id_estabelecimento);
          throw new HttpException('Erro ao atualizar usuário com o estabelecimento', 500);
        }

        return { id_estabelecimento: response.id_estabelecimento };
      } catch (error) {
        console.log(error);
        throw new HttpException('Erro ao criar estabelecimento', 500);
      }
    }

    //Rota para buscar estabelecimento pelo token
    async buscaEstabelecimentoPorUserId(userId: number) {

      const user = await this.userService.getUserById(userId)

      if(!user || user.id_estabelecimento == undefined || user.id_estabelecimento == null) throw new HttpException("usuário não possui estabelecimento vinculado a ele", 404)
      
      return await this.estabelecimentoService.buscaEstabelecimento(user.id_estabelecimento)
    }

    // Rota para alterar estabelecimento
    async alteraEstabelecimento(dados: any, userId: number) {
      const user = await this.userService.getUserById(userId)

      if(!user || !user.id_estabelecimento || user.tipo !== 'Gerente' || user.id_estabelecimento !== dados.id) {
        throw new Error('Usuário não encontrado ou não possui permissão para alterar este estabelecimento');
      }

      const id = dados.id
      delete dados.id;

      return await this.estabelecimentoService.alteraEstabelecimento(id, dados)
    }

    // Rota para cadastrar endereço
    async cadastrarEndereco(data: CriarEnderecoDTO, user: any): Promise<{ id_endereco: number }> {
        const usuario = await this.userService.getUserByEmail(user.email);

        if (!usuario?.id_estabelecimento) {
            throw new HttpException('Usuário não possui estabelecimento vinculado', 400);
        }

        const enderecos = await this.enderecoService.encontrarEnderecoPorEstabelecimento(usuario.id_estabelecimento);

        const enderecoExistente = enderecos.find(end => JSON.stringify(end) === JSON.stringify(data));
        if (enderecoExistente) {
            throw new HttpException('Endereço já cadastrado para este estabelecimento', 400);
        }

        try {
            const response = await this.enderecoService.cadastrarEndereco(data, usuario.id_estabelecimento, usuario.tipo);
            console.log(response)
            if(isNumber(response?.id_endereco )) return { id_endereco: response?.id_endereco };
        } catch (error) {
            throw new HttpException('Erro ao cadastrar endereço', 500);
        }

        throw new HttpException('Erro ao cadastrar endereço', 500);
    }

    // Rota para buscar endereço
    async buscaEndereco(userId: number) {
      const user = await this.userService.getUserById(userId);

      if(!user || !user.id_estabelecimento) {
        throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
      }

      const endereco = await this.enderecoService.encontrarEnderecoPorEstabelecimento(user.id_estabelecimento);

      if(!endereco || endereco.length === 0) {
        throw new HttpException('Nenhum endereço encontrado para este estabelecimento', 404);
      }

      return endereco;
    }

    // Rota para alterar endereço
    async alteraEndereco(data: AlteraEnderecoDTO, userId: number){
      const user = await this.userService.getUserById(userId)

      if(!user || !user.id_estabelecimento) {
        throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
      }

      const endereco = await this.enderecoService.encontrarEnderecoPorEstabelecimento(user.id_estabelecimento);

      for (const end of endereco) {
        if (end.id_endereco === data.id) {
          return await this.enderecoService.alteraEndereco(data);
        }
      }

      throw new HttpException('Endereço não encontrado para este estabelecimento', 404);

    }

    // Rota para deletar endereço
    async deletaEndereco(id: number, userId: number) {
        const user = await this.userService.getUserById(userId);

        if (!user || !user.id_estabelecimento) {
            throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
        }

        const enderecos = await this.enderecoService.encontrarEnderecoPorEstabelecimento(user.id_estabelecimento);

        for (const end of enderecos) {
            if (end.id_endereco === id) {
                return await this.enderecoService.deletaEndereco(id);
            }
        }

        throw new HttpException('Endereço não encontrado para este estabelecimento', 404);
    }

    // Rota para cadastrar foto na galeria
    async cadastrarFotoGaleria(userId: number, fileName: string) {
        const user = await this.userService.getUserById(userId);
        if (!user || !user.id_estabelecimento) {
            throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
        }

        return await this.galeriaService.adicionaFotoGaleria(user.id_estabelecimento, fileName);
    }

    //rota pra buscar todas as fotos de um estabelecimento
    async buscaGaleiraPorEstabelecimento(userId: number): Promise<Array<string>> {
      const user = await this.userService.getUserById(userId)
      if(!user || !user.id_estabelecimento) throw new HttpException('Usuário não possui Estbalecimento vinculado a ele', 404)

      const imagens = await this.galeriaService.encontraFotoPorEstabelecimento(user.id_estabelecimento)
      const urls = imagens.map(image => `http://localhost:3000/gerente/gallery/${image.foto}`);

      return urls
    }

    //rota para buscar foto da galeria
    async buscaFotoGaleria(userId: number, name: string): Promise<string> {
      const user = await this.userService.getUserById(userId)

      if(!user || !user.id_estabelecimento) throw new HttpException('Usuário não possui estabelecimetno vinculado', 404)
      
      const path = join(__dirname,"..","..","images","gallery", name).replace("dist", "src");
      
      if(!fs.existsSync(path)) throw new HttpException('Imagem não encontrada', 404)
      
      return path
    }

    //rota para deletar foto da galeria
    async deletaGaleria(id: number, userId: number) {
        const user = await this.userService.getUserById(userId);

        if (!user || !user.id_estabelecimento) {
            throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
        }

        const galeria = await this.galeriaService.encontraFotoPorEstabelecimento(user.id_estabelecimento);

        for (const item of galeria) {
            if (item.id_gal === id) {

              const path = join(__dirname,"..","..","images","gallery", item.foto).replace("dist", "src");
              
              try {
                fs.promises.unlink(path)
              } catch (erro) {
                console.error("Erro ao deletar arquivo:", erro);
                throw new HttpException('Erro ao deletar arquivo', 500);
              }
              return await this.galeriaService.deletaGaleria(item.id_gal);
            }
        }

        throw new HttpException('Galeria não encontrada para este estabelecimento', 404);
    }

    // rota para criar contato
    async cadastaContato(data: any, userId: number) {
      const user = await this.userService.getUserById(userId);
      if (!user || !user.id_estabelecimento) {
          throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
      }

      const correctData = {
        ...(data.tel_cel_1 && { tel_cel_1: data.tel_cel_1 }),
        ...(data.tel_cel_2 && { tel_cel_2: data.tel_cel_2 }),
        ...(data.email && { email: data.email }),
      }

      return await this.contatoService.criaContato(correctData, user.id_estabelecimento);
    }

    //rota para buscar contato
    async buscaContato(userId: number) {
      const user = await this.userService.getUserById(userId)

      if(!user || !user.id_estabelecimento) throw new HttpException('Usuário não possui estabelecimento vinculado', 404)

      return await this.contatoService.encontraContatoPorEstabelecimento(user.id_estabelecimento)
    }

    //rota para alterar contato
    async alteraContato(data: any, userId: number) {
      const user = await this.userService.getUserById(userId);
      if (!user || !user.id_estabelecimento) {
          throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
      }

      const contato = await this.contatoService.encontraContatoPorEstabelecimento(user.id_estabelecimento)

      if (!contato) {
          throw new HttpException('Contato não encontrado para este estabelecimento', 404);
      }

      const correctData = {
        ...(data.tel_cel_1 && { tel_cel_1: data.tel_cel_1 }),
        ...(data.tel_cel_2 && { tel_cel_2: data.tel_cel_2 }),
        ...(data.email && { email: data.email }),
      }

      return await this.contatoService.alteraContato(correctData, contato.id_contato);
    }

    //rota para cadastrar evento
    async cadastraEvento(data: CriarEventoDTO, userId: number, file: string): Promise<EventoDTO>  {
      console.log(file)
      const user = await this.userService.getUserById(userId);

      if (!user || !user.id_estabelecimento) {
        throw new HttpException('Usuário não encontrado ou não possui estabelecimento vinculado', 404);
      }

      const estabelecimento = await this.estabelecimentoService.buscaEstabelecimento(user.id_estabelecimento);

      if(!estabelecimento || estabelecimento.Usuario[0].id_estabelecimento != user.id_estabelecimento) throw new HttpException({status: 404, error: 'Estabelecimento não encontrado'}, 404)
      return await this.eventoService.cadastraEvento(data, estabelecimento.id_estabelecimento, 1 , file)
     
    }

    //rota para buscar eventos por estabelecimento
    async buscaEventoPorEstabelecimento(userId: number): Promise<EventoDTO[]> {
      const user = await this.userService.getUserById(userId)

      if(!user || !user.id_estabelecimento) throw new HttpException('Usuário não possue establecimento vinculado', 404)

      const event = await this.eventoService.buscaPorEstabelecimento(user.id_estabelecimento)

      return event.map(evento => ({
        ...evento,
        foto: `http://localhost:3000/gerente/events/?id=${evento.foto}`
      }));

      
    }

    //rota para alterar evento
    async alteraEvento(userId: number, eventId: number, file: string, data: CriarEventoDTO) {
      const user = await this.userService.getUserById(userId)

      if(!user || !user.id_estabelecimento) throw new HttpException('Usuário não possui estabelecimento vinculado', 404)

      const event = await this.eventoService.buscaEventoPorId(eventId)

      if(!event || event.id_estabelecimento != user.id_estabelecimento) throw new HttpException('Evento não encontrado', 404)
      
      const path = join(__dirname,"..","..","images","events", event.foto).replace("dist", "src");
              
      try {
        await fs.promises.unlink(path)

        await this.eventoService.alteraCategoria(eventId, data.categoria)
      } catch (erro) {
        console.error("Erro ao alterar evento:", erro);
        throw new HttpException('Erro ao alterar evento', 500);
      }

      await this.eventoService.alteraEvento(data, file, eventId).then(response => {
        return response
      }).catch(error => {
        console.log(error)
      })
    }

    //rota para deletar evento
    async deletaEvento(userId: number, eventId: number){
      const user = await this.userService.getUserById(userId)

      if(!user || !user.id_estabelecimento) throw new HttpException('Usuário não possui estabelecimento vinculado', 404)

      const event = await this.eventoService.buscaEventoPorId(eventId)

      if(event?.id_estabelecimento != user.id_estabelecimento) throw new HttpException('Não foi possivel encontrar o evento', 404)

      return await this.eventoService.deletaEvento(eventId)
    }
}