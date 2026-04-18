# Implementation Plan - Hybrid Onboarding Authentication

## Goal
- Allow the onboarding flow to work for authenticated and unauthenticated users.
- Let guests complete the full flow before Google login.
- Persist all collected onboarding data only after authentication.
- Eliminate duplicated finalization logic and reduce data loss risk.

## Delivery Strategy
- Implement in small phases with a stable checkpoint after each phase.
- Do not change the visual onboarding structure first; fix the state and persistence model before polishing UI.
- Move final persistence responsibility to the backend before removing old frontend save paths.

## Phase 1 - Frontend Draft Abstraction

### Objective
- Replace scattered onboarding `localStorage` keys with one draft storage module and one auth-intent module.

### Files to add
- `front-bio4dev/src/features/onboarding/storage.ts`
- `front-bio4dev/src/features/onboarding/types.ts`

### Files to update
- `front-bio4dev/src/pages/CreateProfilePage.tsx`
- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- `front-bio4dev/src/pages/AuthCallbackPage.tsx`

### Tasks
1. Define typed objects:
- `OnboardingDraft`
- `OnboardingAuthIntent`

2. Implement storage helpers:
- `createDraft()`
- `loadDraft(draftId)`
- `saveDraft(draft)`
- `clearDraft(draftId)`
- `setAuthIntent(intent)`
- `getAuthIntent()`
- `consumeAuthIntent()`

3. Keep backward compatibility during rollout:
- Read the new storage format first.
- If missing, optionally read legacy keys once and migrate them into the new draft shape.

4. Update `CreateProfilePage.tsx`:
- Create the draft through the new helper instead of writing multiple keys directly.
- Save `slug`, `displayName`, and `templateType` inside the draft object.

5. Update `InfluencerOnboardingPage.tsx`:
- Load state from the draft object.
- Persist state through the helper instead of direct `localStorage` writes.
- Remove assumptions based on global `bio4dev_profile_id`.

### Done when
- A guest can start onboarding, refresh the page, and resume from the same draft using only the new storage helpers.

## Phase 2 - Backend Finalization Endpoint

### Objective
- Add a single authenticated endpoint that creates and persists the real profile and related onboarding data.

### Files to add
- `src/onboarding/onboarding.controller.ts`
- `src/onboarding/onboarding.service.ts`
- `src/onboarding/onboarding.module.ts`
- `src/dto/onboarding.dto.ts`

### Files to update
- `src/app.module.ts`
- `src/profile/profile.service.ts`
- `src/dto/profiles.dto.ts`

### Tasks
1. Create DTOs for finalization:
- `FinalizeOnboardingDto`
- nested DTOs for platforms and additional links if needed

2. Add authenticated route:
- `POST /onboarding/finalize`
- protect it with `JwtAuthGuard`

3. In the service:
- derive `userId` from `req.user`, not from request body
- validate profile limit
- validate and normalize slug
- create profile if the draft still maps to a new profile
- persist profile bio/avatar/template data
- replace socials
- replace link buttons
- create or update legenda

4. Wrap writes in a Prisma transaction.

5. Add idempotency guard:
- if the same draft is finalized twice during callback retries, return the existing result instead of creating a duplicate profile

### Design note
- If there is no existing table for finalized draft tracking, the first implementation can use a deterministic lookup based on authenticated user plus normalized slug.
- If duplicate risk remains too high, add a lightweight persistence table in a later step.

### Done when
- A logged-in user can send one request and receive a complete preview-ready profile.

## Phase 3 - Auth Handoff Refactor

### Objective
- Use OAuth only for authentication recovery, then trigger the new finalization endpoint with the exact draft that requested login.

### Files to update
- `front-bio4dev/src/stores/authStore.ts`
- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- `front-bio4dev/src/pages/AuthCallbackPage.tsx`
- `src/auth/google-oauth/google-oauth.controller.ts`
- `src/auth/google-oauth/google-oauth.service.ts`

### Tasks
1. Before redirecting to Google:
- save the draft
- save auth intent with `draftId`
- optionally persist a nonce for state validation

2. Improve OAuth state usage:
- correlate callback intent to the exact draft that started auth
- reject mismatched or missing state where possible

3. Refactor `AuthCallbackPage.tsx`:
- finish login
- read and consume auth intent
- if intent is `onboarding_finalize`, load the draft and call `POST /onboarding/finalize`
- route using backend response

4. Remove duplicated finalization logic from the callback and onboarding page once the new flow is stable.

### Done when
- Guest completion after Google login relies on one finalization path only.

## Phase 4 - Frontend Final Submit Cleanup

### Objective
- Make the last onboarding action deterministic for both auth states.

### Files to update
- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- `front-bio4dev/src/lib/api.ts`

### Tasks
1. Add `onboardingApi.finalize()`.
2. In `handleFinish`:
- if authenticated, call `onboardingApi.finalize(draft)`
- if unauthenticated, save draft and start Google login

3. Remove old code paths that:
- create profile directly from the onboarding page
- persist socials separately before finalization
- reconstruct completion from legacy keys

4. Clear draft only after backend success.

### Done when
- The onboarding page owns only draft collection and final submit orchestration.

## Phase 5 - UX and Recovery States

### Objective
- Make the auth handoff and failure cases understandable and recoverable.

### Files to update
- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- `front-bio4dev/src/pages/AuthCallbackPage.tsx`
- any shared loading/error component if one exists

### Tasks
1. Replace generic failure toasts with state-aware feedback:
- login required
- saving profile
- slug conflict
- profile limit reached
- transient retryable error

2. Keep the draft intact on:
- callback failure
- slug conflict
- partial backend error

3. Add a simple recovery CTA:
- `Tentar novamente`
- `Voltar e corrigir slug`

### Done when
- The user never needs to restart onboarding after a recoverable auth or persistence error.

## Phase 6 - Legacy Cleanup

### Objective
- Remove storage and code paths that are no longer needed.

### Files to review
- `front-bio4dev/src/pages/CreateProfilePage.tsx`
- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- `front-bio4dev/src/pages/AuthCallbackPage.tsx`
- `front-bio4dev/src/hooks/useSaveTemplate.ts`

### Tasks
1. Remove unused legacy keys:
- `bio4dev_profile_id`
- `bio4dev_post_auth_redirect`
- legacy draft fragments that are replaced by the unified draft object

2. Remove dead branches related to guest-to-real-profile conversion in two different places.

3. Keep `useSaveTemplate` focused on real profile persistence only, or fold it into the new onboarding finalization path if it becomes redundant.

### Done when
- There is one guest draft model, one auth handoff model, and one finalization path.

## Suggested Order of Implementation
1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6

## Testing Plan

### Frontend/manual scenarios
1. Authenticated user starts onboarding and finishes without being redirected to login.
2. Guest user completes onboarding, logs in with Google, and lands in preview with all data persisted.
3. Guest user refreshes mid-onboarding and retains progress.
4. OAuth callback retries do not create duplicate profiles.
5. Slug conflict after callback preserves draft and allows retry.
6. Profile limit reached after callback preserves draft and routes clearly.

### Backend tests
- Finalize endpoint creates all related records.
- Finalize endpoint rejects unauthenticated requests.
- Finalize endpoint rejects invalid slug.
- Finalize endpoint respects profile limit.
- Finalize endpoint is safe on repeated requests for the same draft intent.

## Risks
- Migrating from legacy storage can leave old drafts stranded if migration is partial.
- Idempotency is the hardest part of the backend refactor and should be tested early.
- Existing frontend save helpers may still write partial data if not fully removed.

## Recommended First PR Scope
- Limit the first implementation PR to:
  - Phase 1
  - Phase 2
  - minimal Phase 3 wiring

This gives the project the new backbone without mixing in too much UI polish or storage cleanup at once.
