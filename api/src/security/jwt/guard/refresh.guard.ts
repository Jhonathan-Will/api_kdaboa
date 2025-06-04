import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RefreshService } from '../refersh.service';

@Injectable()
export class RefreshGuard extends AuthGuard('jwt') {
  constructor(
    private refreshService: RefreshService
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
      res.cookie('token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });

      return payload as TUser;
    } catch (e) {
      console.log(e)
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

    throw new UnauthorizedException('Token inválido');
  }
}
