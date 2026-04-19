import { PrismaClient } from '@prisma/client';
import { createHmac } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hmacEmail(email: string, secret: string): string {
  return createHmac('sha256', secret).update(email).digest('hex');
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const u = user || '';
  const d = domain || '';
  const maskedUser =
    u.length <= 2 ? `${u[0] || '*'}*` : `${u[0]}***${u.slice(-1)}`;
  const maskedDomain =
    d.length <= 3 ? `${d[0] || '*'}**` : `${d[0]}***${d.slice(-1)}`;
  return `${maskedUser}@${maskedDomain}`;
}

async function main() {
  const hmacKey = getEnv('EMAIL_HMAC_KEY');
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      emailIndex: true,
      emailBcrypt: true,
      emailMasked: true,
    },
  });

  console.log(`Processing ${users.length} users...`);

  for (const user of users) {
    if (!user.email) {
      continue; // nothing to hash
    }

    const normalized = normalizeEmail(user.email);
    const emailIndex = hmacEmail(normalized, hmacKey);
    const emailBcrypt = await bcrypt.hash(normalized, rounds);
    const emailMasked = maskEmail(normalized);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailIndex,
        emailBcrypt,
        emailMasked,
        emailHashVersion: 1,
      },
    });
  }

  console.log('Backfill completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
