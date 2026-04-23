# Developer Draft Google Auth Handoff Design

Date: 2026-04-22

## Summary

Bug: user without active session clicks final CTA in developer draft editor and sees `"Aguarde a sessão ser restaurada e tente novamente."` instead of entering Google login flow.

Desired behavior:

- guest user can edit developer draft normally
- guest user clicking final CTA sees the same Google login gate used by influencer onboarding
- after successful account creation / login, frontend restores session and creates developer profile from local draft
- authenticated user still saves directly without extra login step

User preference locked:

- behavior must match influencer portfolio flow
- login starts only when user clicks final create/save CTA
- profile is created only after Google auth succeeds

## Current Root Cause

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx` blocks finalization when `authStatus === 'booting'`
- `booting` is valid both for a guest session still being resolved and for a returning authenticated session
- this guard treats unresolved auth as an error instead of deciding between:
  - finalize immediately for authenticated user
  - start Google auth handoff for guest user

Practical effect:

- true guest users hit an auth restoration toast even though they are not supposed to already be logged in
- the app never reaches the existing `developer_draft_finalize` handoff path for those users

## Options Considered

### Option 1: Follow influencer handoff for developer drafts

- keep local draft in browser
- on final CTA, save draft intent and redirect to Google when user is not authenticated
- after callback success, restore session and finalize draft

Pros:

- matches product behavior already accepted in influencer flow
- reuses existing dev draft auth intent and callback finalization path
- fixes guest bug with small surface area

Cons:

- still depends on frontend draft persistence in same browser

### Option 2: Keep current flow and only wait out `booting`

- replace toast with delayed retry / bootstrap wait

Pros:

- very small code diff

Cons:

- still centers the flow on auth restoration timing
- does not clearly align dev behavior with influencer flow
- can still produce confusing UX when guest user expects Google login immediately

### Option 3: Create profile shell before auth

- create anonymous backend draft/profile first
- bind it to account after login

Pros:

- strongest long-term persistence model

Cons:

- unnecessary scope for current bug
- requires backend session and cleanup expansion

## Recommendation

- choose Option 1
- remove the `booting` error path from guest finalization
- let the final CTA branch into:
  - authenticated: finalize now
  - unresolved/guest: open shared Google auth gate, then preserve draft and start Google login from the gate CTA

## Target Behavior

### Final CTA decision

- validate current draft and slug first
- if session is already authenticated, finalize draft directly
- if session is unresolved or guest, do not show restoration error
- instead open the same Google auth gate already used by influencer onboarding
- only when the user confirms in the gate:
  - persist draft as `pending_auth`
  - store `developer_draft_finalize` auth intent
  - redirect browser to `/auth/google`

### OAuth callback

- keep `front-bio4dev/src/pages/AuthCallbackPage.tsx` as the single post-login resume point
- after successful callback:
  - restore session with `bootstrapAuth()`
  - reload draft from local storage
  - call `developerOnboardingApi.finalize(...)`
  - clear draft and auth intent on success

### Error handling

- canceled / failed Google login keeps draft in browser
- missing draft after callback redirects to `/profile/create/developer` with clear error toast
- slug conflict after callback returns user to editor with API error
- profile limit errors keep current dashboard redirect behavior
- toast `"Aguarde a sessão ser restaurada e tente novamente."` must not appear for guest users starting this flow

## Public Interfaces / State Changes

- no backend API contract change required
- no new storage keys required
- frontend decision logic in `DeveloperDraftEditorPage` changes from "block on `booting`" to "branch into finalize or shared auth gate"
- frontend gains a shared Google auth gate component reused by influencer and developer flows

## Test Plan

1. Guest user opens developer draft editor and clicks final CTA
2. App opens the shared Google auth gate instead of showing session restoration toast
3. Clicking the gate CTA redirects to Google and successful callback restores session and creates developer profile
4. Authenticated user clicks final CTA and saves directly without Google redirect
5. Canceling Google login keeps draft available in same browser
6. Slug conflict after callback returns recoverable error without losing draft
7. No regression in existing influencer onboarding auth handoff

## Assumptions

- current backend `developerOnboardingApi.finalize` endpoint already requires authenticated session and remains source of truth for profile creation
- same-browser draft persistence is acceptable for this flow
- scope excludes changing copy or visual shell outside what is necessary for the auth handoff bug
