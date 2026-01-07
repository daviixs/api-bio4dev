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
import { SocialController } from './social/social.controller';
import { SocialService } from './social/social.service';
import { TechstackController } from './techstack/techstack.controller';
import { TechstackService } from './techstack/techstack.service';
import { WorkexperienceService } from './workexperince/workexperience.service';
import { WorkexperinceController } from './workexperince/workexperience.controller';
import { FooterController } from './footer/footer.controller';
import { FooterService } from './footer/footer.service';

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
    SocialController,
    TechstackController,
    WorkexperinceController,
    FooterController,
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
    SocialService,
    TechstackService,
    WorkexperienceService,
    FooterService,
  ],
})
export class AppModule {}
