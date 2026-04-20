import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { GoogleOAuthModule } from './google-oauth/google-oauth.module';
import { JwtCustomModule } from './jwt/jwt-custom.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';

@Module({
  imports: [
    UsersModule,
    GoogleOAuthModule,
    JwtCustomModule,
    RefreshTokenModule,
    JwtModule.register({
      secret: process.env.SECRETKEY,
      signOptions: {
        expiresIn: (process.env.EXPIRESIN ?? '1h') as any,
      },
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [
    PassportModule,
    GoogleOAuthModule,
    JwtCustomModule,
    RefreshTokenModule,
  ],
})
export class AuthModule {}
