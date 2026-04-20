import { faker } from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';

export function createGoogleProfilePayload() {
  return {
    googleId: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    picture: faker.image.avatar(),
  };
}

export function createProfilePayload() {
  return {
    username: faker.string.alphanumeric({ length: 15, casing: 'lower' }),
    slug: faker.string.alphanumeric({ length: 15, casing: 'lower' }),
    bio: faker.lorem.paragraph().substring(0, 50),
    avatarUrl: faker.image.avatar(),
    theme: 'DARK',
    templateType: 'template_01',
  };
}

/**
 * Creates an expired token for a given user ID to test 401 flows
 */
export function createExpiredToken(userId: string): string {
  const payload = { sub: userId, email: 'fake@fake.com' };
  // Expired 1 hour ago
  return jwt.sign(payload, 'fake_secret', { expiresIn: '-1h' });
}

/**
 * Forges an unverified, tampered token to test validation checks.
 */
export function createTamperedToken(
  validToken: string,
  newUserId: string,
): string {
  const parts = validToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  payload.sub = newUserId;

  const newPayloadBase64 = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/=/g, '');
  return `${parts[0]}.${newPayloadBase64}.${parts[2]}`;
}

/**
 * Creates a token without any signature algorithm (alg: none)
 */
export function createNoneAlgorithmToken(userId: string): string {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = { sub: userId, email: 'hacker@hack.com' };

  const hdr = Buffer.from(JSON.stringify(header)).toString('base64url');
  const bdy = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${hdr}.${bdy}.`;
}
