# Implementation Plan - Developer Draft Google Auth Handoff

## Goal

- make developer draft final CTA behave like influencer flow for guest users
- remove false auth restoration error for guests
- keep direct save path for authenticated users
- reuse the same Google login gate UI between influencer and developer flows

## Delivery Strategy

- keep change focused on frontend auth decision logic
- reuse existing dev draft auth intent and callback finalization path
- avoid backend contract changes unless implementation proves a real gap

## Phase 1 - Align final CTA decision logic

### Objective

- stop treating `authStatus === 'booting'` as immediate user-facing error and route guest users into the auth gate

### Files to update

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Remove current toast guard that blocks on `booting`.
2. Rework final CTA decision to match influencer semantics:
   - direct finalize when authenticated
   - open Google auth gate otherwise
3. If needed, resolve pending auth bootstrap before deciding direct-save path for returning logged-in users.

### Done when

- guest click no longer dies on restoration toast
- guest click opens the gate and only the gate CTA starts Google login
- authenticated click still avoids unnecessary Google redirect

## Phase 2 - Share the Google auth gate UI

### Objective

- remove duplicated modal markup and keep a single source of truth for the Google auth gate

### Files to update

- `front-bio4dev/src/components/shared/GoogleAuthGate.tsx`
- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Extract the existing influencer gate markup into a shared component.
2. Pass copy and style slots as props so influencer and dev can share layout but keep different messaging.
3. Keep influencer behavior unchanged after the extraction.

### Done when

- both flows render the same gate component
- only copy and chrome differ between them

## Phase 3 - Keep callback resume path intact

### Objective

- verify existing callback page already completes dev draft finalization after login

### Files to review / update if needed

- `front-bio4dev/src/pages/AuthCallbackPage.tsx`
- `front-bio4dev/src/features/developer-create/storage.ts`

### Tasks

1. Confirm callback still consumes `developer_draft_finalize` intent exactly once.
2. Confirm success path clears draft + auth intent after finalize.
3. Confirm recoverable failures return user to draft route.

### Done when

- post-login resume path remains single-source and idempotent

## Phase 4 - Verify user-visible states

### Objective

- keep button labels and loading states coherent during direct save and Google handoff

### Files to review / update if needed

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Ensure guest CTA still reads `Criar conta e salvar`.
2. Ensure authenticated CTA still reads `Salvar portfólio`.
3. Ensure loading state disables duplicate submits during direct finalize and during Google login handoff.

### Done when

- CTA copy and loading behavior still match actual flow

## Phase 5 - Regression checks

### Objective

- confirm fix works without breaking existing auth flows

### Validation

1. Guest draft final CTA opens the Google auth gate.
2. Gate CTA redirects to Google.
3. Successful callback creates profile from draft.
4. Authenticated user final CTA saves directly.
5. Canceled login keeps draft available.
6. Frontend build passes.

### Done when

- manual smoke checks and build validate the narrowed fix
