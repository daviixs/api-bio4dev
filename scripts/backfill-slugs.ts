import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Iniciando backfill de slugs...');

  // Buscar todos os profiles sem slug (string vazia ao invés de null)
  const profiles = await prisma.profile.findMany({
    where: {
      OR: [{ slug: '' }],
    },
    select: {
      id: true,
      username: true,
      userId: true,
    },
  });

  console.log(`📊 Encontrados ${profiles.length} profiles sem slug`);

  let updated = 0;
  let errors = 0;

  for (const profile of profiles) {
    try {
      // Gerar slug base do username
      let slug = profile.username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      let counter = 1;

      // Verificar se slug já existe
      let existingProfile = await prisma.profile.findUnique({
        where: { slug },
      });

      // Se existir, adicionar sufixo numérico
      while (existingProfile && existingProfile.id !== profile.id) {
        slug = `${profile.username.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${counter}`;
        counter++;
        existingProfile = await prisma.profile.findUnique({
          where: { slug },
        });
      }

      // Atualizar profile com slug e isActive (primeiro profile do user = ativo)
      const userProfilesCount = await prisma.profile.count({
        where: { userId: profile.userId },
      });

      const isActive = userProfilesCount === 1; // Se é o único profile, ativar

      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          slug,
          isActive,
          updatedAt: new Date(),
        },
      });

      console.log(
        `✅ Profile ${profile.username} → slug: ${slug} (isActive: ${isActive})`,
      );
      updated++;
    } catch (error) {
      console.error(`❌ Erro ao atualizar profile ${profile.username}:`, error);
      errors++;
    }
  }

  console.log('\n📈 Resumo do backfill:');
  console.log(`   ✅ Atualizados: ${updated}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`   📊 Total: ${profiles.length}`);

  if (errors === 0) {
    console.log('\n🎉 Backfill concluído com sucesso!');
  } else {
    console.log(
      '\n⚠️ Backfill concluído com alguns erros. Verifique os logs acima.',
    );
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal no backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
