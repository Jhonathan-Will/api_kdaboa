import { Injectable, HttpException } from "@nestjs/common";
import { GerenteModel } from "./interface/gerente.model";
import { CriarEstabelecimentoDTO } from "./dto/criarEstabelecimento.dto";
import { JwtService } from '@nestjs/jwt';
import { UsersService } from "../users.service";
@Injectable()
export class GerenteService {
    
    constructor(private readonly gerenteModel: GerenteModel, private readonly userService: UsersService) {}

    async criarEstabelecimento(estabelecimento: CriarEstabelecimentoDTO, id: number) {
      this.gerenteModel.criarEstabelecimento(estabelecimento).then((response) => {
          console.log(response)

          return this.userService.updateUser(id, {id_estabelecimento: response.id_estabelecimento})
      })
    }

    async updateGerente(user: any, estabelecimento: any) {
      const usuario = this.gerenteModel.verificaExistencia(user.email)
    }
}