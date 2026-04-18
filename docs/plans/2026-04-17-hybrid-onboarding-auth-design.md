# Hybrid Onboarding Authentication Flow

## Context
- The product has an onboarding flow that also acts as a conversion funnel.
- Authenticated users must continue normally and save data directly to their account.
- Unauthenticated users must complete the full onboarding without interruption and only authenticate at the end.
- The current codebase already supports a local draft flow for guests, but the finalization path is fragmented between the onboarding page and the Google OAuth callback.
- The user clarified that draft persistence only needs to survive in the same browser until login. Cross-device resume is not required.

## Current Diagnosis

### What exists today
- Guest onboarding starts by generating a local `draft-*` identifier and saving draft metadata in `localStorage`.
- The onboarding page persists form state locally while the user progresses through the steps.
- If the user is not authenticated at the end, the frontend triggers Google OAuth and attempts to finish persistence after the callback.

### Likely bug sources
- Finalization is duplicated in two places:
  - `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
  - `front-bio4dev/src/pages/AuthCallbackPage.tsx`
- The callback tries to reconstruct the correct draft from global `localStorage` keys such as `bio4dev_profile_id` instead of an explicit finalized intent.
- Google OAuth `state` is generated but is not clearly validated or used to correlate the callback to the exact onboarding draft.
- The profile creation API accepts `userId` from the client body, which is weaker than deriving the user from the authenticated session.
- Persistence is performed as a series of frontend-driven calls instead of a single backend finalization operation, which increases the chance of partial writes and hard-to-recover states.

### Practical effect
- A guest can fill the onboarding, authenticate successfully, and still lose or mis-associate data during the handoff from draft to real account.
- A refresh, repeated callback, stale local key, or duplicated tab can produce wrong routing or inconsistent persistence.

## Options Considered

### Option 1: Keep local draft, finalize in a single authenticated backend endpoint
- Store the guest draft only in the browser.
- After login, call one authenticated endpoint such as `POST /onboarding/finalize`.
- The backend creates the profile and related records in a transaction.

Pros
- Fits the current product requirement.
- Removes duplicated logic from the frontend.
- Reduces partial persistence and duplicate profile creation.
- Keeps infrastructure simple.

Cons
- Requires a new backend endpoint and a small refactor of the current save flow.

### Option 2: Keep the current local draft model and centralize finalization in the frontend only
- Continue using `localStorage`.
- Remove one of the two finalization paths and keep only one frontend-driven completion path.

Pros
- Lower short-term implementation cost.

Cons
- Still depends on multiple API calls from the client.
- Still fragile around retries, partial writes, and stale draft context.
- Leaves too much flow-critical logic in the callback page.

### Option 3: Create anonymous onboarding sessions in the backend
- Start a server-side onboarding session before authentication.
- Persist guest progress temporarily in the backend.
- Bind the session to the user after Google login.

Pros
- Strongest long-term architecture.
- Supports cross-device and long-lived resume if needed later.

Cons
- Unnecessary complexity for the current requirement.
- Adds backend storage, cleanup, and session lifecycle concerns.

## Recommendation
- Choose Option 1.
- Keep guest draft persistence in `localStorage`.
- Move the final save responsibility to a single authenticated backend finalization endpoint.
- Use the OAuth handoff only to recover auth and route back to the correct draft, not to persist the entire onboarding through fragmented frontend logic.

## Target Architecture

### 1. Draft session in the browser
- The frontend owns a single draft object per onboarding flow.
- The draft is identified by `draftId`.
- The draft contains all collected onboarding data plus metadata required for the auth handoff.

Suggested shape:

```json
{
  "version": 1,
  "draftId": "draft-uuid",
  "status": "collecting",
  "templateType": "template_04",
  "slug": "my-slug",
  "displayName": "My Name",
  "data": {
    "step": 3,
    "selectedPlatforms": [],
    "platformLinks": {},
    "additionalLinks": [],
    "bio": "",
    "avatarDataUrl": ""
  },
  "createdAt": "2026-04-17T12:00:00.000Z",
  "updatedAt": "2026-04-17T12:10:00.000Z"
}
```

### 2. Auth intent
- Before redirecting to Google, the frontend stores a small auth handoff object:

```json
{
  "intent": "onboarding_finalize",
  "draftId": "draft-uuid",
  "returnTo": "/onboarding/draft-uuid",
  "createdAt": "2026-04-17T12:11:00.000Z"
}
```

- The OAuth `state` must correlate with this handoff.
- On callback, the app must recover the exact `draftId` that requested login.

### 3. Single finalization endpoint
- Add an authenticated endpoint such as `POST /onboarding/finalize`.
- The frontend sends the draft payload after authentication.
- The backend derives `userId` from the authenticated session or JWT, never from the request body.
- The backend creates or updates all required entities in one place.

Suggested backend responsibilities:
- Validate authenticated user.
- Validate profile limit.
- Validate and normalize slug.
- Create profile if this is still a draft.
- Upsert legenda/profile base info.
- Replace socials.
- Replace link buttons.
- Return `profileId`, `templateType`, and next redirect target.

### 4. Transactional persistence
- The finalization endpoint should wrap the persistence sequence in a database transaction.
- Either all required records are committed, or none are.
- This prevents "profile created but socials missing" and similar half-saved states.

## State Machine

### States
- `draft_initialized`
- `collecting`
- `ready_to_finish`
- `pending_auth`
- `authenticated`
- `finalizing`
- `completed`
- `recoverable_error`

### Transitions
1. `draft_initialized -> collecting`
- User starts onboarding and the frontend creates `draftId`.

2. `collecting -> collecting`
- User edits fields.
- Draft is autosaved locally.

3. `collecting -> ready_to_finish`
- User reaches the last step and passes local validation.

4. `ready_to_finish -> finalizing`
- User is already authenticated.
- Frontend calls `POST /onboarding/finalize`.

5. `ready_to_finish -> pending_auth`
- User is not authenticated.
- Frontend stores auth intent and redirects to Google OAuth.

6. `pending_auth -> authenticated`
- OAuth callback succeeds.

7. `authenticated -> finalizing`
- Frontend recovers the same `draftId` and calls `POST /onboarding/finalize`.

8. `finalizing -> completed`
- Backend persists all data successfully and returns `profileId`.

9. `finalizing -> recoverable_error`
- Backend rejects due to slug conflict, limit reached, validation issue, or transient failure.
- Draft remains stored locally so the user can retry.

## Frontend Responsibilities

### Onboarding page
- Read and write exactly one draft object.
- Stop performing real persistence for guest users.
- On final submit:
  - if authenticated, call `finalizeOnboarding(draft)`
  - if unauthenticated, save draft, store auth intent, start Google login

### OAuth callback page
- Complete login only.
- Recover `draftId` from the auth handoff.
- If the intent is `onboarding_finalize`, call `finalizeOnboarding(draft)` once.
- Do not reconstruct the flow from scattered keys like `bio4dev_profile_id` when an explicit handoff exists.

### Draft store
- Replace multiple loosely related `localStorage` keys with a small draft storage module.
- Expose helpers:
  - `createDraft()`
  - `loadDraft(draftId)`
  - `saveDraft(draft)`
  - `setAuthIntent(intent)`
  - `consumeAuthIntent()`
  - `clearDraft(draftId)`

## Backend Responsibilities

### New endpoint
- `POST /onboarding/finalize`

Request body example:

```json
{
  "draftId": "draft-uuid",
  "templateType": "template_04",
  "slug": "my-slug",
  "displayName": "My Name",
  "bio": "Short bio",
  "avatarDataUrl": "https://...",
  "selectedPlatforms": ["instagram"],
  "platformLinks": {
    "instagram": "@handle"
  },
  "additionalLinks": [
    {
      "label": "Website",
      "url": "https://example.com"
    }
  ]
}
```

Response body example:

```json
{
  "profileId": "uuid",
  "templateType": "template_04",
  "redirectTo": "/dashboard/influencer/template_04/uuid/preview"
}
```

### Security rules
- Require authentication.
- Derive the acting user from JWT or session.
- Ignore client-provided `userId`.
- Treat repeated finalization for the same draft as idempotent where possible.

### Idempotency strategy
- The frontend should send a `draftId`.
- The backend can record a finalized onboarding marker or use a deterministic lookup to avoid creating duplicate profiles on callback retries.

## Temporary Persistence Strategy

### Recommended
- Use `localStorage` as the only temporary guest persistence layer.
- Save a single versioned draft object.
- Save a separate, small auth intent object.

### Why this is enough
- The product does not require cross-device resume.
- Google OAuth redirect returns to the same browser session.
- The complexity of server-side anonymous drafts is not justified yet.

### Not recommended for now
- Temporary backend session store for guests.
- Cookies as the primary onboarding data store.
- Keeping multiple global keys without a draft abstraction layer.

## Data Loss Prevention
- Autosave draft on field changes with debounce.
- Force save on step change.
- Force save immediately before OAuth redirect.
- Never clear the draft before finalization success.
- On finalization failure, keep the draft intact and route the user back to the onboarding flow with an actionable error.
- If the slug becomes unavailable after the user returns from Google, surface the conflict and allow correction without discarding collected data.

## UX Notes
- The end-of-flow auth prompt should feel like the last step of completion, not a blocker.
- Recommended copy:
  - "Sua bio está pronta. Falta só conectar com Google para salvar."
- After callback, use a short progress sequence:
  - "Conectando conta"
  - "Salvando sua bio"
  - "Abrindo preview"

This keeps conversion momentum and makes the auth handoff feel like part of the completion flow.

## Rollout Plan

### Phase 1
- Create a draft storage module in the frontend.
- Replace scattered onboarding persistence keys with the new module.
- Remove duplicated finalization logic from onboarding and callback.

### Phase 2
- Add `POST /onboarding/finalize` in the backend.
- Move profile creation and related persistence there.
- Derive the user from auth instead of request body.

### Phase 3
- Wire the callback to recover auth intent and trigger finalization.
- Add recoverable error UI for slug conflict and limit reached.

### Phase 4
- Clean up obsolete local storage keys and dead paths.
- Add tests for guest flow, authenticated flow, callback retry, and error recovery.

## Validation
- Guest user completes full onboarding and authenticates only at the end.
- Authenticated user completes onboarding without extra auth prompts.
- OAuth callback retry does not create duplicate profiles.
- Slug conflict after callback keeps the draft and returns the user to correction.
- Profile limit reached after callback does not discard draft silently.
