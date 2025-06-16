import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RefreshService } from '../refersh.service';
import { CsrfService } from 'src/security/csrf/csrf.service';

@Injectable()
export class RefreshGuard extends AuthGuard('jwt') {
  constructor(
    private refreshService: RefreshService,
    private readonly csrf: CsrfService
  ) {
    super();
  }

 handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
  const req: Request = context.switchToHttp().getRequest();
  const res: Response = context.switchToHttp().getResponse();

  if (user) return user;

  if (info?.name === 'TokenExpiredError') {
    const refreshToken = req.cookies['refresh_token'] as string;
    if (!refreshToken) throw new UnauthorizedException('Refresh token ausente');

    try {
      const payload = this.refreshService.verifyRefreshToken(refreshToken);
      const newAccessToken = this.refreshService.refresh(payload);

      const csrfToken = this.csrf.generateToken({email: payload.email, sub: payload.sub, status: payload.status});

      res.cookie('token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
      res.cookie('x-csrf-token', csrfToken, { httpOnly: false, secure: true, sameSite: 'lax', path: '/' });

      req.cookies['x-csrf-token'] = csrfToken;
      
      return payload as TUser;
    } catch (e) {
      console.log(e)
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

    throw new UnauthorizedException('Token inválido');
  }
}
