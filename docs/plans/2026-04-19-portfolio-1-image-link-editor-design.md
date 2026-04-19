# Portfolio 1 Image Link Editor Design

## Context

`portfolio_1` dev editor currently lets user click profile image, but image change UX is broken for dev template flow. User wants link-only image editing:

- click image
- open small card/dialog
- paste image URL
- save
- image updates in editor and persists after refresh

No file upload. No backend/schema change.

## Goal

Replace browser `prompt()` image editing with small in-app dialog for `portfolio_1` dev template.

## Scope

Frontend only.

Primary file:

- `front-bio4dev/src/components/portfolio/EditableHero.tsx`

Optional parent touch only if needed:

- `front-bio4dev/src/components/portfolio/EditablePortfolio1.tsx`

No changes to:

- DB schema
- backend routes
- profile/legenda save contract

## Chosen Approach

Use small dialog/card modal opened by clicking image area.

Why:

- better UX than `prompt()`
- works on desktop/mobile
- clear save/cancel flow
- easy to validate URL before save
- reuses existing avatar persistence flow

Rejected alternatives:

1. Keep `prompt()`
   - too brittle
   - no preview
   - poor usability
2. Permanent inline input
   - noisy UI
   - hurts portfolio editing surface

## UX Design

When user clicks image or pencil overlay:

- open compact dialog/card
- show current image preview
- show single `Image URL` input
- prefill current value from:
  - `profile.avatarUrl`
  - fallback `legenda.legendaFoto`
- show actions:
  - `Cancelar`
  - `Salvar`

No upload button. Link only.

## Behavior

On save:

1. trim input
2. if missing protocol, prepend `https://`
3. validate final URL
4. if invalid, show error toast and keep dialog open
5. if valid, call existing avatar save flow
6. disable actions while saving
7. close dialog on success
8. update preview immediately

## Data Flow

Existing save flow remains source of truth:

- update `profile.avatarUrl`
- sync `legenda.legendaFoto`

Public and editor render paths should continue preferring synchronized values so refreshed editor and public page show same image.

## Error Handling

- empty input: reject with toast
- malformed URL: reject with toast
- save failure from API: keep dialog open, show toast
- success: close dialog, show updated image

## Success Criteria

- clicking image opens dialog every time
- user can paste image link and save
- image updates in editor immediately
- refresh keeps image
- public `template_01` shows same image

## Verification

Manual QA:

1. open dev `portfolio_1` editor
2. click image
3. dialog opens
4. paste raw domain URL and save
5. image updates
6. refresh page
7. image persists
8. open public preview/page
9. same image appears
