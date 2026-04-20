import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ProfileOwnershipService {
  constructor(private readonly prisma: PrismaService) {}

  async assertProfileOwnership(profileId: string, authenticatedUserId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { id: true, userId: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    // Security best practice: writes and internal reads use server-side
    // ownership checks instead of trusting client-supplied profile IDs.
    if (profile.userId !== authenticatedUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    return profile;
  }

  assertSelfAccess(targetUserId: string, authenticatedUserId: string) {
    if (targetUserId !== authenticatedUserId) {
      throw new ForbiddenException('Acesso negado');
    }
  }
}
