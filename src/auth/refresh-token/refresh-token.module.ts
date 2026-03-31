import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';
import { JwtCustomModule } from '../jwt/jwt-custom.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [JwtCustomModule, PrismaModule],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
