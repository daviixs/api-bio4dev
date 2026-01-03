import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { PrismaService } from './database/prisma.service';
import { PrismaModule } from './database/prisma.module';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { PageController } from './page/page.controller';
import { PageService } from './page/page.service';
import { LegendaService } from './legenda/legenda.service';
import { LegendaController } from './legenda/legenda.controller';
import { ConfigController } from './config/config.controller';
import { ConfigService } from './config/config.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AppController,
    UsersController,
    ProfileController,
    PageController,
    LegendaController,
    ConfigController,
    ProjectsController,
  ],
  providers: [
    AppService,
    UsersService,
    PrismaService,
    ProfileService,
    PageService,
    LegendaService,
    ConfigService,
    ProjectsService,
  ],
})
export class AppModule {}
