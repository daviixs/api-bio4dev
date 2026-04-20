import { PrismaService } from 'src/database/prisma.service';

export async function deleteUserByEmail(
  prisma: PrismaService,
  emailIndex: string,
): Promise<void> {
  await prisma.user.deleteMany({
    where: { emailIndex },
  });
}

export async function deleteProfileByUserId(
  prisma: PrismaService,
  userId: string,
): Promise<void> {
  await prisma.profile.deleteMany({
    where: { userId },
  });
}

export async function cleanAll(prisma: PrismaService): Promise<void> {
  // Ordered by Foreign Key dependency chains to avoid constraint errors
  await prisma.$transaction([
    prisma.visit.deleteMany(),
    prisma.templateSocial.deleteMany(),
    prisma.templatePage.deleteMany(),
    prisma.template.deleteMany(),
    prisma.custom.deleteMany(),
    prisma.page.deleteMany(),
    prisma.social.deleteMany(),
    prisma.legenda.deleteMany(),
    prisma.projeto.deleteMany(),
    prisma.linkButton.deleteMany(),
    prisma.config.deleteMany(),
    prisma.workResponsibility.deleteMany(),
    prisma.workTechnology.deleteMany(),
    prisma.workExperience.deleteMany(),
    prisma.technology.deleteMany(),
    prisma.techStack.deleteMany(),
    prisma.footer.deleteMany(),
    prisma.previewToken.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
