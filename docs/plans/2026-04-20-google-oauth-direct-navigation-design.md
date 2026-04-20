# Google OAuth Direct Navigation Design

Date: 2026-04-20

## Summary

Bug: the landing page at `http://localhost:4000` starts Google login by calling `GET /auth/google` via XHR to the backend at `http://localhost:3000`, which fails in the browser with CORS errors.

Desired behavior:

- clicking "Continue with Google" should start login without any CORS dependency
- the backend should own the OAuth flow from start to finish
- the frontend should only trigger login and resolve post-login navigation
- refresh tokens must remain cookie-only
- onboarding draft handoff must continue working after login

## Current Diagnosis

- The frontend currently calls `GET /auth/google` via `axios` and expects JSON with `{ url, state }`.
- The backend sets the OAuth state cookie on `/auth/google` and expects that cookie during `/auth/google/callback`.
- This pattern is more fragile than a standard web OAuth redirect flow because it depends on:
  - exact CORS allowlist behavior
  - credentials-enabled XHR
  - cookies surviving a cross-origin API call before the browser leaves the SPA
- The current local environment is additionally misconfigured with `CORS_ORIGIN=*`, which is incompatible with credentials-based requests.

## Options Considered

### Option 1: Direct browser navigation to backend-owned OAuth flow

- The frontend uses `window.location.assign()` to navigate to `/auth/google`.
- The backend responds with a redirect to Google.
- Google returns to the backend callback.
- The backend creates the authenticated session and redirects back to the frontend callback page.

Pros

- Most robust and standard web OAuth model.
- Removes CORS from the start-login step.
- Keeps OAuth secrets and token exchange in the backend.
- Fits the current cookie-based refresh token model.

Cons

- Requires changing both backend and frontend callback responsibilities.

### Option 2: Keep `GET /auth/google` returning JSON

- The frontend keeps fetching `/auth/google` and then manually redirects to the returned URL.

Pros

- Lower implementation cost.

Cons

- Still depends on CORS plus credentials.
- More fragile in local and production environments.
- Leaves an avoidable failure mode in a critical auth path.

### Option 3: Frontend-managed Google SDK login

- The frontend gets a Google token and sends it to the backend for session creation.

Pros

- Can work well for SPA-driven login UX.

Cons

- Larger architecture change.
- More moving parts in the client.
- Does not improve the current cookie-session model enough to justify the migration.

## Recommendation

- Choose Option 1.
- Move the OAuth initiation and callback handling fully to the backend.
- Keep the frontend callback page, but reduce it to session restoration and post-login routing only.

## Target Architecture

### 1. Login initiation

- The landing page does not call `fetch` or `axios` for Google login.
- Before leaving the SPA, the frontend stores any local handoff state it needs, such as:
  - onboarding `authIntent`
  - post-auth redirect target
- The frontend then performs direct navigation to the backend:

```text
window.location.assign(`${API_URL}/auth/google`)
```

### 2. Backend-owned OAuth start

- `GET /auth/google` generates:
  - `state`
  - `code_verifier`
  - `code_challenge`
- The backend stores the minimum required OAuth handoff data in a short-lived cookie.
- The backend responds with `302` to Google.
- This endpoint no longer returns JSON.

### 3. Backend-owned OAuth callback

- Google returns to `GET /auth/google/callback` on the backend.
- The backend validates:
  - `state`
  - PKCE correlation using `code_verifier`
  - Google callback error conditions
- The backend exchanges the authorization code for tokens.
- The backend finds or creates the user.
- The backend sets the refresh token in an `HttpOnly` cookie.
- The backend clears the transient OAuth handoff cookie.
- The backend redirects the browser back to the frontend callback page, for example:

```text
/auth/callback/google?status=success
```

### 4. Frontend callback page

- The frontend callback page no longer reads or forwards the Google `code`.
- It no longer calls `/auth/google/callback`.
- Its responsibilities are:
  - restore session using the existing refresh/bootstrap flow
  - read local handoff data such as onboarding `authIntent`
  - continue to the correct route after the backend session already exists

### 5. Session model

- Refresh token remains cookie-only.
- Access token remains short-lived and frontend-memory-oriented.
- No sensitive token is placed in query parameters.
- OAuth protocol details stay in the backend.

## Data Flow

1. User clicks "Continue with Google" in the landing page.
2. Frontend stores local post-auth context.
3. Frontend navigates directly to `GET /auth/google`.
4. Backend generates OAuth handoff state and redirects to Google.
5. Google authenticates the user and redirects to backend callback.
6. Backend validates callback data, creates session cookies, and redirects to frontend callback page.
7. Frontend callback page restores authenticated state.
8. If onboarding auth intent exists, frontend finalizes the draft.
9. If no onboarding intent exists, frontend resumes the saved redirect or falls back to `/dashboard`.

## Security and Error Handling

### Security requirements

- Use Authorization Code Flow with PKCE.
- Use a short-lived, one-time OAuth handoff cookie.
- Keep refresh token in `HttpOnly` cookie only.
- Use `SameSite=Lax` and `Secure` in production for session cookies.
- Never send `refresh_token`, `accessToken`, or Google tokens through the URL.
- Keep explicit CORS allowlist for API requests that still need credentials.
- Remove wildcard `CORS_ORIGIN=*` from environments using credentials.

### Error handling

- If Google returns an OAuth error, the backend clears transient OAuth cookies and redirects to the frontend callback page with a sanitized error reason.
- If `state` or PKCE validation fails, the backend must not create a session and must redirect with a safe error marker.
- If the frontend callback page fails to restore the session after a successful backend callback, it should show a recoverable error and route the user back to retry safely.

## Frontend Changes

- Replace `loginWithGoogle()` XHR initiation with direct navigation.
- Simplify `AuthCallbackPage` so it no longer submits OAuth codes.
- Keep existing onboarding draft handoff logic, but run it only after session restoration.
- Keep dashboard and silent refresh behavior compatible with the existing auth bootstrap flow.

## Backend Changes

- Change `GET /auth/google` from JSON response to redirect response.
- Add PKCE generation and validation for the web login flow.
- Store transient OAuth correlation data in a cookie suitable for the redirect flow.
- Change `GET /auth/google/callback` to finish authentication and redirect to the frontend instead of returning session JSON for browser consumption.

## Test Plan

1. `GET /auth/google` returns `302` and sets the transient OAuth cookie.
2. The landing page no longer performs `axios.get('/auth/google')`.
3. A valid Google callback creates the session cookie and redirects to frontend callback.
4. Missing or mismatched `state` fails without creating a session.
5. PKCE validation failures fail without creating a session.
6. Frontend callback page restores session without forwarding Google `code`.
7. Guest onboarding still finalizes the saved draft after login.
8. Authenticated users still land in `/dashboard` when no saved redirect exists.
9. No sensitive token appears in browser URLs or frontend storage.

## Success Criteria

- Clicking Google login from `http://localhost:4000` no longer triggers CORS errors.
- Local login succeeds with backend on `http://localhost:3000`.
- Onboarding draft handoff remains intact after login.
- The frontend callback page becomes a routing/session-finalization step, not an OAuth transport step.
- The flow is aligned with a standard backend-owned web OAuth implementation.
