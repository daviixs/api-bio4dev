import { Module } from '@nestjs/common';
import { JwtCustomService } from './jwt-custom.service';
import { JwksService } from './jwks.service';
import { JwksController } from './jwks.controller';

@Module({
  controllers: [JwksController],
  providers: [JwtCustomService, JwksService],
  exports: [JwtCustomService, JwksService],
})
export class JwtCustomModule {}
