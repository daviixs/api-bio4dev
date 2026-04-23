# Dev portfolio overlay layering design

## Context

Developer portfolio editors use shared Radix-based overlays. Some portfolio headers and sticky navbars use z-index values above `z-50`, so modal content can render behind page chrome.

## Goal

Make shared overlays render above developer portfolio headers in a single global fix, without changing each portfolio individually.

## Chosen approach

1. Keep existing header and sticky navigation behavior.
2. Define shared overlay layer tokens for portal-based UI.
3. Apply higher z-index layers to shared `Dialog`, `AlertDialog`, `Drawer`, and `Sheet` primitives.
4. Validate with frontend build.

## Layer scale

- Overlay backdrop: `z-[140]`
- Overlay content: `z-[150]`

This keeps modal content above current portfolio headers like portfolio 3 navbar (`z-[100]`) while avoiding per-page z-index patches.

## Expected result

- Project, avatar, resume, and other editor dialogs stay above sticky headers across developer portfolios.
- Future overlays built on shared primitives inherit same behavior automatically.
