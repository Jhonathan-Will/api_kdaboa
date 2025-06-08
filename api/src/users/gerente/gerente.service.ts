import { Injectable, HttpException } from "@nestjs/common";
import { CriarEstabelecimentoDTO } from "./dto/criarEstabelecimento.dto";
import { UsersService } from "../users.service";
import { CriarEnderecoDTO } from "./dto/criarEndreço.dto";
import { CsrfService } from "src/security/csrf/csrf.service";
import { PrismaService } from "src/prisma/prisma.service";
import { EnderecoService } from "src/features/endereco.service";
import { EstabelecimentoService } from "src/features/estabelecimento.service";

@Injectable()
export class GerenteService {
    
    constructor(private readonly userService: UsersService,
                private readonly csrf: CsrfService,
                private prisma: PrismaService,
                private readonly enderecoService: EnderecoService,
                private readonly estabelecimentoService: EstabelecimentoService) {}

    async criarEstabelecimento(data: CriarEstabelecimentoDTO, id: number, userType: string) {
      await this.estabelecimentoService.criaEstabelecimento(data, userType).then((response) => {

        this.userService.updateUser(id, {id_estabelecimento: response.id_estabelecimento}).catch(error => {
            console.log(error)
            this.estabelecimentoService.deletaEstabelecimento(response.id_estabelecimento)

            throw new HttpException('Erro ao atualizar usuário com o estabelecimento', 500);
        })

        return response;

      }).catch(error => {
        console.log(error)
        throw new HttpException('Erro ao criar estabelecimento', 500);
      })
    }

    async cadastrarEndereco(data: CriarEnderecoDTO, user: any, csrfToken: string){
        if(this.csrf.validateToken(csrfToken)) {

            const usuario = await this.userService.getUserByEmail(user.email).then(async (user) => {
                if(!user?.id_estabelecimento) throw new HttpException('Usuário não possui estabelecimento vinculado', 400);
                
                const endereco = await this.enderecoService.encontrarEnderecoPorEstabelecimento(user.id_estabelecimento);
                console.log(endereco)

                endereco.forEach(end => {
                    if(end == data) throw new HttpException('Endereço já cadastrado para este estabelecimento', 400);
                });
                
            return  await this.enderecoService.cadastrarEndereco(data, usuario.id_estabelecimento , usuario.tipo);
          })

        }

        throw new HttpException('Token CSRF inválido', 403);
    }
}