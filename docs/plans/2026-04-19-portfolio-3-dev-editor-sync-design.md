# Portfolio 3 Dev Editor Sync Design

Date: 2026-04-19

## Summary

`portfolio3` dev editor has broken save flows because editor state does not fully match backend-required fields or DB shape.

Main failures:

- hero fields can fail on first save when no `legenda` row exists
- footer email/contact/CV can fail on first save when no `footer` row exists
- project modal is not synced with DB fields
- project create/update can fail because editor sends `gif: "#111111"` while backend currently expects a valid URL

Goal:

- make `portfolio3` hero, footer, CV, and projects editable and persistent
- use existing DB fields already available in backend
- keep current visual style of template 3
- fix both editor preview and public template behavior

## Current Data Mapping Problems

### Hero

Current editor uses:

- `legenda.titulo` for headline
- `legenda.descricao` for description
- `profile.avatarUrl` or `legenda.legendaFoto` for avatar

Problem:

- first `legenda` create can fail because backend requires `subtitulo`, but current create defaults may send `''`
- avatar update only writes `profile.avatarUrl`, leaving `legenda.legendaFoto` unsynced

### Footer

Current editor uses:

- `footer.subtitle` for contact text
- `footer.email` for contact email
- `footer.resumeUrl` for CV link

Problem:

- first `footer` create can fail when saving `email` or `resumeUrl` because backend requires non-empty `title`, `subtitle`, and `copyrightName`
- current defaults can still produce invalid empty required values

### Projects

Current project modal only edits:

- `nome`
- one `link`
- `thumbnail`
- first tag as `subtitle`

But DB shape already supports:

- `nome`
- `descricao`
- `demoLink`
- `codeLink`
- `gif`
- `tags`

Problems:

- modal drops DB fields
- editor merges `demoLink` and `codeLink` into one field
- editor uses `gif: "#111111"` fallback, which backend rejects after current URL validation

## Chosen Approach

Recommended approach: repair `portfolio3` editor contract without schema changes.

Why:

- existing DB already has correct fields
- fixes persistence without backend schema migration
- avoids hidden data loss in project editing
- keeps template-specific behavior contained to `portfolio3`

## Intended Data Contract

### Hero

- headline -> `legenda.titulo`
- description -> `legenda.descricao`
- avatar -> write to both `profile.avatarUrl` and `legenda.legendaFoto`

When `legenda` does not exist, create it with safe defaults:

- `profileId`
- `nome`
- `titulo`
- `subtitulo`
- `descricao`
- `legendaFoto`

Defaults must always satisfy backend validation.

### Footer

- contact description -> `footer.subtitle`
- contact email -> `footer.email`
- CV link -> `footer.resumeUrl`

When `footer` does not exist, create it with safe defaults:

- `profileId`
- `title`
- `subtitle`
- `copyrightName`

Then patch target field.

### Projects

`portfolio3` project editor must use full DB shape:

- `nome`
- `descricao`
- `demoLink`
- `codeLink`
- `gif`
- `tags`

Public and editor cards keep compact visual layout, but data model remains full.

## Editor Behavior

### Hero

- headline remains inline editable
- description remains inline editable
- save path creates `legenda` row first if missing
- avatar dialog remains link-based
- avatar save normalizes URL and syncs both avatar fields

### Footer

- contact text remains inline editable
- email remains inline editable
- CV button remains dialog-based
- save path creates `footer` row first if missing
- email must pass email validation before API request
- CV URL is normalized before save

### Projects

Project modal becomes full form with:

- project name
- description
- demo link
- code link
- cover image URL
- tags as comma-separated input

Rules:

- raw public domains -> prepend `https://`
- localhost / LAN / private IP -> prepend `http://`
- empty optional fields stay empty
- invalid URL blocked before API request with clear editor toast
- if cover image URL is empty, send a valid fallback image URL instead of color token

Project card behavior:

- editor cards remain clickable and open edit modal
- public template links to `demoLink`, fallback `codeLink`

## Rendering Rules

### Editor Preview

- hero headline shows `legenda.titulo`
- hero description shows `legenda.descricao`
- CV button reflects `footer.resumeUrl`
- footer shows `footer.subtitle` and `footer.email`
- project cards render from full project objects, even if UI stays compact

### Public Template

- use same source of truth as editor
- avatar prefers `profile.avatarUrl`, fallback `legenda.legendaFoto`
- footer description prefers `footer.subtitle`, fallback `legenda.descricao`
- project card link prefers `demoLink`, fallback `codeLink`

## Files In Scope

Primary:

- `front-bio4dev/src/components/portfolio/EditablePortfolio3.tsx`
- `front-bio4dev/src/components/portfolio/portfolio3Shared.tsx`
- `front-bio4dev/src/templates/Template03.tsx`

Possible secondary:

- `src/dto/footer.dto.ts` only if backend validation still blocks intended valid saves
- `src/dto/projects.dto.ts` only if project cover rules need backend alignment beyond URL normalization

## Validation Plan

Manual verification:

1. first-time save with no existing `legenda`
2. edit hero headline
3. edit hero description
4. edit avatar and refresh
5. first-time save with no existing `footer`
6. edit footer contact description
7. edit footer email
8. add CV link
9. add project with:
   - public raw domain
   - localhost URL
   - LAN/private IP URL
10. edit existing project fields individually
11. refresh editor page
12. verify public template shows same values

Build verification:

- backend `npm run build`
- frontend `npm run build`

## Risks

- existing project records with color-token `gif` values may need graceful render fallback if they already exist in DB
- create-vs-update paths must not duplicate `legenda` or `footer`
- optimistic local state must match API response shape to avoid false success in editor

## Recommendation

Implement contract repair in `portfolio3` editor first, with no schema change.

This gives:

- correct first-save behavior
- full DB sync for projects
- consistent render between editor and public template
- no hidden loss of `descricao`, `demoLink`, `codeLink`, or `tags`
