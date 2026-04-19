# Dashboard Auth Bootstrap Design

Date: 2026-04-19

## Summary

Bug: user logged in opens `/dashboard` directly or reloads it, but frontend redirects to `/profile/type` instead of staying in dashboard.

Current root cause:

- `ProtectedRoute` in `front-bio4dev/src/App.tsx` decides too early based on incomplete auth restoration
- auth state has no explicit bootstrap lifecycle
- route guard performs imperative redirect before session resolution is finished

Desired behavior:

- logged-in user opening `/dashboard` stays in dashboard
- logged-in user reloading `/dashboard` stays in dashboard
- logged-in user with no profile stays in dashboard and sees empty state
- logged-out user opening `/dashboard` is redirected to `/profile/type`

User preference locked:

- choose bigger refactor
- fix `/dashboard` access behavior
- do not change direct `/profile/type` behavior for authenticated users in this task
- if authenticated user has no profile, keep them on dashboard with empty state

## Key Changes

### Auth session bootstrap

- Add explicit auth bootstrap lifecycle to frontend auth store
- Replace current binary auth assumption (`isAuthenticated`) with resolved session state, e.g.:
  - `booting`
  - `authenticated`
  - `guest`
- Add store action such as `bootstrapAuth()` that:
  - runs once per app load
  - restores persisted session data
  - attempts silent refresh when needed
  - resolves final auth state without redirect side effects
- Do not persist bootstrap status itself
- Avoid duplicate refresh calls by making bootstrap idempotent / shared in-flight

### Route guarding

- Refactor `ProtectedRoute` to be declarative instead of imperative
- Remove `navigate()` side effects from the route guard
- `ProtectedRoute` behavior:
  - `booting` -> render loading placeholder or null
  - `authenticated` -> render protected content
  - `guest` -> render `<Navigate to="/profile/type" replace />`
- Apply same behavior to all protected dashboard routes, not just `/dashboard`

### Dashboard compatibility

- Keep current dashboard empty-state behavior as source of truth for authenticated users without profiles
- Do not auto-redirect authenticated/no-profile users to profile creation
- Keep `loadProfile()` separate from auth bootstrap; dashboard data loading remains profile-driven

### Auth callback compatibility

- Keep `AuthCallbackPage` setting session as it does now
- Ensure new bootstrap flow does not regress callback success path
- Silent refresh failures during bootstrap should not emit toasts; they should resolve to `guest`

## Public Interfaces / State Changes

- Frontend auth store gains explicit bootstrap/session resolution state and a bootstrap action
- `ProtectedRoute` contract changes from “self-refresh then navigate” to “render based on resolved auth state”
- No backend API shape changes required

## Test Plan

1. Logged-in user opens `/dashboard` directly and remains on dashboard
2. Logged-in user reloads `/dashboard` and remains on dashboard
3. Logged-in user with no profile opens `/dashboard` and sees empty state, not `/profile/type`
4. Logged-out user opens `/dashboard` and is redirected to `/profile/type`
5. Logged-in user can still access `/dashboard/bio`, `/dashboard/analytics`, and `/dashboard/settings`
6. OAuth callback still lands authenticated user in dashboard flow correctly
7. No redirect loop, no duplicate refresh storm, no visible flash of wrong page

## Assumptions

- Existing backend refresh cookie flow is valid enough for this task; issue is frontend session bootstrap timing
- Scope excludes changing landing CTAs for authenticated users
- Scope excludes redirecting authenticated users away from `/profile/type`
- Minimal loading UI during bootstrap is acceptable as long as wrong-page flash is avoided
