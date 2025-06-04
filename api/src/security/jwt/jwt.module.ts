import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshGuard } from './guard/refresh.guard';
import { RefreshService } from './refersh.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        privateKey: (process.env.PRIVATE_KEY ?? (() => { throw new Error('PRIVATE_KEY is not defined'); })()).replace(/\\n/g, '\n'),
        publicKey: (process.env.PUBLIC_KEY ?? (() => { throw new Error('PUBLIC_KEY is not defined'); })()).replace(/\\n/g, '\n'),
        signOptions: {
          algorithm: 'RS256',
        },
      }),
    }),
  ],
  providers: [JwtStrategy, RefreshGuard, RefreshService],
  exports: [JwtModule, JwtStrategy, RefreshGuard, RefreshService],
})
export class SecurityJwtModule {}