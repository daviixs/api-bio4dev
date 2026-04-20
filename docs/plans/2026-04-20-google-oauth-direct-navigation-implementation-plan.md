# Implementation Plan - Google OAuth Direct Navigation

## Goal

- Remove the CORS-sensitive XHR start step from Google login.
- Move the full OAuth browser flow under backend control.
- Keep the frontend responsible only for triggering login and handling post-login routing.
- Preserve the current cookie-based refresh session model.
- Keep onboarding auth handoff working after login.

## Delivery Strategy

- Refactor the flow in small steps so each phase can be tested independently.
- Change backend redirect behavior before removing frontend callback assumptions.
- Keep local recovery logic in the frontend callback page until backend session restoration is confirmed stable.

## Phase 1 - Fix Environment and Backend Contract

### Objective

- Align the backend configuration with credentialed sessions and the new redirect-based OAuth contract.

### Files to update

- `src/main.ts`
- `.env`
- optional environment docs if needed

### Tasks

1. Replace wildcard `CORS_ORIGIN=*` with explicit local origins.
2. Confirm `GOOGLE_REDIRECT_URI` points to backend callback, not frontend callback.
3. Keep `credentials: true` for the API routes that still need cookies.
4. Verify the backend can still serve refresh/logout/session flows after the origin changes.

### Done when

- Credentialed API requests from the frontend use explicit allowed origins.
- Google callback URI is owned by the backend.

## Phase 2 - Backend OAuth Start Refactor

### Objective

- Convert `GET /auth/google` from JSON response to redirect response.

### Files to update

- `src/auth/google-oauth/google-oauth.controller.ts`
- `src/auth/google-oauth/google-oauth.service.ts`
- `src/auth/google-oauth/dto/google-oauth.dto.ts`

### Tasks

1. Remove the JSON response shape for browser login initiation.
2. Generate:
   - `state`
   - `code_verifier`
   - `code_challenge`
3. Store transient OAuth correlation data in a short-lived cookie.
4. Redirect the browser to Google with Authorization Code Flow plus PKCE.
5. Keep throttling on the route.

### Done when

- `GET /auth/google` returns `302` and sets the transient OAuth cookie.

## Phase 3 - Backend OAuth Callback Refactor

### Objective

- Finish OAuth entirely in the backend and redirect back to the frontend with a sanitized status.

### Files to update

- `src/auth/google-oauth/google-oauth.controller.ts`
- `src/auth/google-oauth/google-oauth.service.ts`
- any JWT/session helper touched by the callback

### Tasks

1. Validate:
   - callback `error`
   - callback `state`
   - PKCE using `code_verifier`
2. Exchange the authorization code.
3. Find or create the user.
4. Set `refresh_token` as `HttpOnly` cookie.
5. Clear the transient OAuth cookie.
6. Redirect to frontend callback page:
   - success: `/auth/callback/google?status=success`
   - failure: `/auth/callback/google?status=error&reason=...`
7. Ensure no sensitive token is returned in JSON or query parameters for browser login flow.

### Done when

- Backend callback can create a session and redirect to the frontend without requiring frontend code exchange.

## Phase 4 - Frontend Login Trigger Refactor

### Objective

- Start Google login by direct browser navigation.

### Files to update

- `front-bio4dev/src/stores/authStore.ts`
- any component that triggers Google login, such as:
  - `front-bio4dev/src/pages/SignupPage.tsx`
  - onboarding entry points that start auth

### Tasks

1. Replace `axios.get('/auth/google')` with direct navigation using `window.location.assign()`.
2. Preserve any local auth handoff state before navigation:
   - `bio4dev_post_auth_redirect`
   - onboarding `authIntent`
3. Keep loading and error UX compatible with a full-page redirect flow.

### Done when

- Clicking the Google login button no longer performs an XHR call to `/auth/google`.

## Phase 5 - Frontend Callback Simplification

### Objective

- Turn the frontend callback page into a session restoration and routing step only.

### Files to update

- `front-bio4dev/src/pages/AuthCallbackPage.tsx`
- `front-bio4dev/src/stores/authStore.ts`

### Tasks

1. Remove code that reads Google `code` and forwards it to the backend.
2. Read only sanitized callback status from the URL.
3. On success:
   - restore session using existing refresh/bootstrap flow
   - hydrate profile if needed
   - continue to onboarding finalization or dashboard routing
4. On error:
   - map safe error reasons to user-facing messages
   - preserve recoverable local draft state
5. Keep callback behavior idempotent so reloads do not break post-login routing.

### Done when

- `AuthCallbackPage` no longer acts as an OAuth transport layer.

## Phase 6 - Onboarding Auth Handoff Verification

### Objective

- Confirm the onboarding guest-to-login path still works with the new redirect model.

### Files to review and update if needed

- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx`
- `front-bio4dev/src/features/onboarding/storage.ts`
- `front-bio4dev/src/lib/api.ts`

### Tasks

1. Ensure the draft and `authIntent` are saved before login redirect.
2. After callback success, consume `authIntent` once.
3. Finalize the onboarding draft only after session restoration succeeds.
4. Preserve the draft on recoverable errors.

### Done when

- Guest onboarding can redirect to Google and resume finalization after successful login.

## Phase 7 - Test Coverage and Regression Checks

### Objective

- Cover the new redirect behavior and prevent auth regressions.

### Files to update

- `test/integration/phase1-google-auth.spec.ts`
- frontend tests if available for auth store or callback page

### Tasks

1. Update backend tests for `GET /auth/google`:
   - expect redirect instead of JSON body
   - assert transient OAuth cookie is set
2. Add tests for backend callback:
   - success path redirects to frontend callback
   - invalid state fails without session
   - error path clears transient cookie
3. Verify existing refresh-token session behavior still works.
4. Manually validate:
   - login from landing page
   - login from onboarding handoff
   - callback reload
   - logout then login again

### Done when

- The new login flow is covered by integration tests and manual smoke checks.

## Recommended Execution Order

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7

## Risks to Watch

- Google Console callback URI may still point to the frontend.
- Cookie path and `SameSite` settings may block the transient OAuth cookie if scoped incorrectly.
- Frontend callback simplification may regress dashboard routing if auth bootstrap is not awaited.
- Onboarding auth handoff may be lost if local intent is not saved before full-page navigation.

## Success Criteria

- Google login starts without any XHR CORS dependency.
- Backend owns both OAuth initiation and callback completion.
- Frontend callback page restores session and routes correctly without handling Google codes.
- No sensitive tokens appear in browser URLs.
- Onboarding guest handoff still works after login.
