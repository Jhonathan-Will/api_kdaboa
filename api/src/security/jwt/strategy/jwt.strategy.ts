import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.PUBLIC_KEY) {
      throw new Error('JWT secret is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req?.query && typeof req.query.token === 'string') {
            return req.query.token;
          }

          const authHeader = req.headers.authorization;
          if (authHeader?.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
          }
           
          if(req?.cookies && req.cookies['token']) {
            return req.cookies['token'];
          }
          
          return null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.PUBLIC_KEY.replace(/\\n/g, '\n') as string,
      algorithms: ['RS256'], // se usar chave pública/privada
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email, status: payload.status, tipo: payload.tipo};
  }
}