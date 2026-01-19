import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { LinkButtonController } from './link-button.controller';
import { LinkButtonService } from './link-button.service';

@Module({
  imports: [PrismaModule],
  controllers: [LinkButtonController],
  providers: [LinkButtonService],
  exports: [LinkButtonService],
})
export class LinkButtonModule {}
