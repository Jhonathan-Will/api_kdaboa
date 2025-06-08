import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RefreshService{

    constructor(private readonly jwtService: JwtService){}

    refresh(payload: any) {
        if (payload.secret === process.env.REFRESH_SECRET) {
            return this.jwtService.sign({
                sub: payload.sub,
                email: payload.email,
                status: payload.status,
                tipo: payload.tipo
            }, {expiresIn: '10min'});
        } else {
            throw new Error('Refresh token inválido');
        }
    }

    verifyRefreshToken(token: string){
       return this.jwtService.verify(token)
    }
}
