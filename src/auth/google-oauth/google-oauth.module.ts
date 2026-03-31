import { Module } from '@nestjs/common';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleOAuthController } from './google-oauth.controller';
import { JwtCustomModule } from '../jwt/jwt-custom.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [JwtCustomModule, PrismaModule],
  controllers: [GoogleOAuthController],
  providers: [GoogleOAuthService],
  exports: [GoogleOAuthService],
})
export class GoogleOAuthModule {}
