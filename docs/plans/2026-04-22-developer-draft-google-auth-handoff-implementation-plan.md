# Implementation Plan - Developer Draft Google Auth Handoff

## Goal

- make developer draft final CTA behave like influencer flow for guest users
- remove false auth restoration error for guests
- keep direct save path for authenticated users

## Delivery Strategy

- keep change focused on frontend auth decision logic
- reuse existing dev draft auth intent and callback finalization path
- avoid backend contract changes unless implementation proves a real gap

## Phase 1 - Align final CTA decision logic

### Objective

- stop treating `authStatus === 'booting'` as immediate user-facing error

### Files to update

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Remove current toast guard that blocks on `booting`.
2. Rework final CTA decision to match influencer semantics:
   - direct finalize when authenticated
   - save intent + start Google login otherwise
3. If needed, resolve pending auth bootstrap before deciding direct-save path for returning logged-in users.

### Done when

- guest click no longer dies on restoration toast
- authenticated click still avoids unnecessary Google redirect

## Phase 2 - Keep callback resume path intact

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

## Phase 3 - Verify user-visible states

### Objective

- keep button labels and loading states coherent during direct save and Google handoff

### Files to review / update if needed

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Ensure guest CTA still reads `Criar conta e salvar`.
2. Ensure authenticated CTA still reads `Salvar portfólio`.
3. Ensure loading state disables duplicate submits during direct finalize.

### Done when

- CTA copy and loading behavior still match actual flow

## Phase 4 - Regression checks

### Objective

- confirm fix works without breaking existing auth flows

### Validation

1. Guest draft final CTA opens Google login.
2. Successful callback creates profile from draft.
3. Authenticated user final CTA saves directly.
4. Canceled login keeps draft available.
5. Frontend build passes.

### Done when

- manual smoke checks and build validate the narrowed fix
