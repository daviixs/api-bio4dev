# Onboarding Social Platform Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make influencer onboarding persist every social platform accepted by the onboarding flow while still skipping platforms outside that onboarding set.

**Architecture:** Keep the global API `Plataforma` enum unchanged. Use the existing onboarding platform map as the backend source for influencer onboarding support, and use one frontend onboarding platform list to avoid stale local filters. Add an e2e regression test that proves all onboarding-flow platforms persist and an out-of-scope platform is still skipped.

**Tech Stack:** NestJS, Prisma, Jest e2e, React, Vite, TypeScript.

---

### Task 1: Add Backend Regression Test

**Files:**
- Create: `test/onboarding-social-platforms.e2e-spec.ts`

- [ ] **Step 1: Create the failing e2e test**

Create `test/onboarding-social-platforms.e2e-spec.ts` with this full content:

```ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GoogleOAuthService } from 'src/auth/google-oauth/google-oauth.service';
import { PrismaService } from 'src/database/prisma.service';
import { bootstrapApp } from './helpers/app.helper';
import { cleanAll } from './helpers/db-cleaner';
import { createGoogleProfilePayload } from './helpers/factories';
import { loginWithGoogleSession } from './helpers/google-auth-session';

jest.setTimeout(30000);

const ONBOARDING_PLATFORM_LINKS = {
  instagram: '@creator',
  whatsapp: '+55 (11) 99999-9999',
  tiktok: 'tiktok.com/@creator',
  youtube: 'youtube.com/@creator',
  website: 'creator.example.com',
  spotify: 'open.spotify.com/user/creator',
  threads: '@creator',
  facebook: 'facebook.com/creator',
  x: '@creator',
  soundcloud: 'soundcloud.com/creator',
  snapchat: '@creator',
  pinterest: 'pinterest.com/creator',
  patreon: 'patreon.com/creator',
  twitch: 'twitch.tv/creator',
  applemusic: 'music.apple.com/profile/creator',
} as const;

const ONBOARDING_PLATFORM_IDS = Object.keys(ONBOARDING_PLATFORM_LINKS);

describe('Influencer onboarding social platform support (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let googleService: GoogleOAuthService;

  beforeAll(async () => {
    app = await bootstrapApp();
    prisma = app.get<PrismaService>(PrismaService);
    googleService = app.get<GoogleOAuthService>(GoogleOAuthService);

    await cleanAll(prisma);

    jest
      .spyOn(googleService, 'exchangeCodeForTokens')
      .mockResolvedValue({ idToken: 'fake', accessToken: 'fake' });
    jest
      .spyOn(googleService, 'verifyGoogleIdToken')
      .mockResolvedValue(createGoogleProfilePayload());
  });

  afterAll(async () => {
    await cleanAll(prisma);
    await app.close();
  });

  it('persists every platform accepted by influencer onboarding and skips out-of-scope platforms', async () => {
    const session = await loginWithGoogleSession(
      app,
      'onboarding-social-platforms-code',
    );
    const slug = `creator-${Date.now()}`;

    const response = await request(app.getHttpServer())
      .post('/onboarding/finalize')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        draftId: `draft-${Date.now()}`,
        templateType: 'template_04',
        slug,
        displayName: 'Creator Links',
        bio: 'Perfil com todas as redes do onboarding.',
        selectedPlatforms: [...ONBOARDING_PLATFORM_IDS, 'github'],
        platformLinks: {
          ...ONBOARDING_PLATFORM_LINKS,
          github: 'github.com/creator',
        },
        additionalLinks: [],
      })
      .expect(201);

    expect(response.body.skippedPlatforms).toEqual(['github']);

    const socials = await prisma.social.findMany({
      where: { profileId: response.body.profileId },
      orderBy: { ordem: 'asc' },
    });

    const storedPlatforms = socials.map((social) => social.plataforma);

    expect(socials).toHaveLength(ONBOARDING_PLATFORM_IDS.length);
    expect(storedPlatforms).toEqual(ONBOARDING_PLATFORM_IDS);
    expect(storedPlatforms).not.toContain('github');
    expect(socials.find((social) => social.plataforma === 'patreon')?.url).toBe(
      'https://patreon.com/creator',
    );
    expect(socials.find((social) => social.plataforma === 'twitch')?.url).toBe(
      'https://twitch.tv/creator',
    );
  });
});
```

- [ ] **Step 2: Run the new test and confirm it fails for the current bug**

Run:

```bash
npm run test:e2e -- onboarding-social-platforms.e2e-spec.ts --runInBand
```

Expected: FAIL. The response `skippedPlatforms` contains currently unsupported onboarding platforms such as `website`, `spotify`, `threads`, `x`, `soundcloud`, `snapchat`, `patreon`, `twitch`, and `applemusic`, so the assertion expecting only `['github']` fails.

### Task 2: Fix Backend Onboarding Allowlist

**Files:**
- Modify: `src/onboarding/onboarding.service.ts`
- Test: `test/onboarding-social-platforms.e2e-spec.ts`

- [ ] **Step 1: Replace the backend allowlist with a map-derived allowlist**

In `src/onboarding/onboarding.service.ts`, replace the existing `DEFAULT_AVATAR_URL`, `SUPPORTED_SOCIAL_PLATFORMS`, and `PLATFORM_SOCIAL_MAP` block at the top of the file with this code:

```ts
const DEFAULT_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars/svg';

const PLATFORM_SOCIAL_MAP: Record<string, Plataforma> = {
  instagram: Plataforma.instagram,
  whatsapp: Plataforma.whatsapp,
  tiktok: Plataforma.tiktok,
  youtube: Plataforma.youtube,
  website: Plataforma.website,
  spotify: Plataforma.spotify,
  threads: Plataforma.threads,
  facebook: Plataforma.facebook,
  x: Plataforma.x,
  soundcloud: Plataforma.soundcloud,
  snapchat: Plataforma.snapchat,
  pinterest: Plataforma.pinterest,
  patreon: Plataforma.patreon,
  twitch: Plataforma.twitch,
  applemusic: Plataforma.applemusic,
};

const SUPPORTED_SOCIAL_PLATFORMS = new Set<Plataforma>(
  Object.values(PLATFORM_SOCIAL_MAP),
);
```

Keep the existing `replaceSocials` implementation unchanged so unknown platform IDs still go through this condition:

```ts
if (!mappedPlatform || !SUPPORTED_SOCIAL_PLATFORMS.has(mappedPlatform)) {
  skippedPlatforms.add(platformId);
  continue;
}
```

- [ ] **Step 2: Run the focused e2e test**

Run:

```bash
npm run test:e2e -- onboarding-social-platforms.e2e-spec.ts --runInBand
```

Expected: PASS. The test persists 15 social rows and returns `skippedPlatforms: ['github']`.

- [ ] **Step 3: Commit the backend fix and regression test**

Run:

```bash
git add src/onboarding/onboarding.service.ts test/onboarding-social-platforms.e2e-spec.ts
git commit -m "fix: support onboarding social platforms"
```

Expected: commit succeeds with the service change and new e2e test.

### Task 3: Align Frontend Onboarding Platform Filters

**Files:**
- Modify: `front-bio4dev/src/features/onboarding/types.ts`
- Modify: `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- Modify: `front-bio4dev/src/pages/influencers/shared/services.ts`
- Modify: `front-bio4dev/src/services/api/types.ts`

- [ ] **Step 1: Make the frontend onboarding platform type derive from one list**

In `front-bio4dev/src/features/onboarding/types.ts`, replace the manual `PlatformId` union with this constant-derived type directly after the `import type { TemplateType } from '@/types';` line:

```ts
export const ONBOARDING_PLATFORM_IDS = [
  'instagram',
  'whatsapp',
  'tiktok',
  'youtube',
  'website',
  'spotify',
  'threads',
  'facebook',
  'x',
  'soundcloud',
  'snapchat',
  'pinterest',
  'patreon',
  'twitch',
  'applemusic',
] as const;

export type PlatformId = (typeof ONBOARDING_PLATFORM_IDS)[number];

export const ONBOARDING_SUPPORTED_PLATFORM_SET: ReadonlySet<string> = new Set(
  ONBOARDING_PLATFORM_IDS,
);
```

The top of the file should then continue with:

```ts
export type AdditionalLink = {
  id: string;
  label: string;
  url: string;
};
```

- [ ] **Step 2: Use the shared platform set in the onboarding page**

In `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`, update the onboarding types import to include `ONBOARDING_SUPPORTED_PLATFORM_SET`:

```ts
import {
  createDefaultOnboardingState,
  ONBOARDING_SUPPORTED_PLATFORM_SET,
  type AdditionalLink,
  type OnboardingDraft,
  type OnboardingState,
  type PlatformId,
} from '@/features/onboarding/types';
```

Delete this stale local block:

```ts
// API ainda nao aceita todas as plataformas do onboarding.
const API_SUPPORTED_PLATFORMS = new Set<PlatformId>([
  'instagram',
  'whatsapp',
  'tiktok',
  'youtube',
  'facebook',
  'pinterest',
]);
```

In `saveSocialsFromPlatforms`, replace the unsupported-platform check with:

```ts
if (!ONBOARDING_SUPPORTED_PLATFORM_SET.has(platformId)) {
  const rawValue = state.platformLinks[platformId] || '';
  if (rawValue.trim()) {
    skippedPlatforms.push(platformId);
  }
  return null;
}
```

- [ ] **Step 3: Use the shared platform set in influencer template saves**

In `front-bio4dev/src/pages/influencers/shared/services.ts`, add this import:

```ts
import { ONBOARDING_SUPPORTED_PLATFORM_SET } from '@/features/onboarding/types';
```

Delete the stale local `API_SUPPORTED_PLATFORMS` constant:

```ts
const API_SUPPORTED_PLATFORMS = new Set([
  'instagram',
  'whatsapp',
  'tiktok',
  'youtube',
  'facebook',
  'pinterest',
]);
```

In `replaceSocials`, replace:

```ts
if (!API_SUPPORTED_PLATFORMS.has(platform)) {
  skippedPlatforms.add(platform);
  continue;
}
```

with:

```ts
if (!ONBOARDING_SUPPORTED_PLATFORM_SET.has(platform)) {
  skippedPlatforms.add(platform);
  continue;
}
```

- [ ] **Step 4: Update the generated-style API platform enum used by frontend services**

In `front-bio4dev/src/services/api/types.ts`, update `export enum Plataforma` so it includes all onboarding platforms. The enum should start like this:

```ts
export enum Plataforma {
  instagram = 'instagram',
  tiktok = 'tiktok',
  youtube = 'youtube',
  github = 'github',
  linkedin = 'linkedin',
  twitter = 'twitter',
  facebook = 'facebook',
  x = 'x',
  threads = 'threads',
  website = 'website',
  spotify = 'spotify',
  soundcloud = 'soundcloud',
  snapchat = 'snapchat',
  patreon = 'patreon',
  twitch = 'twitch',
  applemusic = 'applemusic',
  figma = 'figma',
  devto = 'devto',
  email = 'email',
  behance = 'behance',
  dribbble = 'dribbble',
  medium = 'medium',
  pinterest = 'pinterest',
  gitlab = 'gitlab',
  bitbucket = 'bitbucket',
  stackoverflow = 'stackoverflow',
  codepen = 'codepen',
  discord = 'discord',
  whatsapp = 'whatsapp',
  telegram = 'telegram',
}
```

- [ ] **Step 5: Build the frontend**

Run:

```bash
npm run build --prefix front-bio4dev
```

Expected: PASS. Vite finishes a production build without TypeScript or bundling errors from the new imports.

- [ ] **Step 6: Commit the frontend alignment**

Run:

```bash
git add front-bio4dev/src/features/onboarding/types.ts front-bio4dev/src/pages/InfluencerOnboardingPage.tsx front-bio4dev/src/pages/influencers/shared/services.ts front-bio4dev/src/services/api/types.ts
git commit -m "fix: align frontend onboarding social platforms"
```

Expected: commit succeeds with only frontend platform support changes.

### Task 4: Final Verification

**Files:**
- Verify: `src/onboarding/onboarding.service.ts`
- Verify: `front-bio4dev/src/features/onboarding/types.ts`
- Verify: `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- Verify: `front-bio4dev/src/pages/influencers/shared/services.ts`
- Verify: `front-bio4dev/src/services/api/types.ts`
- Verify: `test/onboarding-social-platforms.e2e-spec.ts`

- [ ] **Step 1: Run backend focused e2e test**

Run:

```bash
npm run test:e2e -- onboarding-social-platforms.e2e-spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run backend build**

Run:

```bash
npm run build
```

Expected: PASS. Nest build completes successfully.

- [ ] **Step 3: Run frontend build**

Run:

```bash
npm run build --prefix front-bio4dev
```

Expected: PASS. Vite build completes successfully.

- [ ] **Step 4: Check git status**

Run:

```bash
git status --short
```

Expected: clean working tree, or only intentional uncommitted files that the worker explicitly reports.
