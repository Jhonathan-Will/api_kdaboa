import { Injectable, HttpException } from "@nestjs/common";
import { CriarEstabelecimentoDTO } from "./dto/criarEstabelecimento.dto";
import { UsersService } from "../users.service";
import { CriarEnderecoDTO } from "./dto/criarEndreço.dto";
import { CsrfService } from "src/security/csrf/csrf.service";
import { PrismaService } from "src/prisma/prisma.service";
import { EnderecoService } from "src/features/endereco.service";

@Injectable()
export class GerenteService {
    
    constructor(private readonly userService: UsersService,
                private readonly csrf: CsrfService,
                private prisma: PrismaService,
                private readonly enderecoService: EnderecoService) {}

    async criarEstabelecimento(data: CriarEstabelecimentoDTO, id: number) {
      await this.prisma.estabelecimento.create({
        data:{
                nome: data.nome,
                cnpj: data.cnpj,
                descricao: data.descricao,
                Estabelecimento_Categoria: {
                    createMany: {
                        data: data.categoria.map((categoriaId: number) => ({ id_categoria: categoriaId }))
                    }
                }
            },
            include: {
                Estabelecimento_Categoria: true
            }
      }).then((response) => {

          return this.userService.updateUser(id, {id_estabelecimento: response.id_estabelecimento})

      }).catch(error => {
        console.log(error)
        throw new HttpException('Erro ao criar estabelecimento', 500);
      })
    }

    async cadastrarEndereco(data: CriarEnderecoDTO, user: any, csrfToken: string) {
        if(this.csrf.validateToken(csrfToken)) {
          console.log("user dentro do servuc ", user)
          const usuario = await this.userService.getUserByEmail(user.email)
          
          if(!usuario || !usuario.id_estabelecimento) {
              throw new HttpException('Usuário não encontrado', 404);
          }

          return  await this.enderecoService.cadastrarEndereco(data, usuario.id_estabelecimento , usuario.tipo);

        }

        throw new HttpException('Token CSRF inválido', 403);
    }
}