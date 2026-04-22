import { Module } from '@nestjs/common';
import { DeveloperOnboardingController } from './developer-onboarding.controller';
import { DeveloperOnboardingService } from './developer-onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

@Module({
  controllers: [OnboardingController, DeveloperOnboardingController],
  providers: [OnboardingService, DeveloperOnboardingService],
})
export class OnboardingModule {}
