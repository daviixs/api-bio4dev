# Implementation Plan - Developer Draft Preview Shell

## Goal

- Replace the current developer draft onboarding header with the same toolbar shell used by influencer `TemplatePreview`.
- Keep all draft/finalize behavior intact.
- Reduce visual drift between preview and editor entry points.

## Delivery Strategy

- Keep the change focused on shell replacement only.
- Reuse existing preview toolbar structure where practical.
- Do not alter template rendering or draft persistence logic.

## Phase 1 - Compare and isolate shell contract

### Objective

- Identify the exact layout and class contract used by `TemplatePreview`.

### Files to inspect/update

- `front-bio4dev/src/pages/influencers/shared/TemplatePreview.tsx`
- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Compare wrapper spacing, toolbar card container, and CTA group structure.
2. Identify which strings and actions differ between influencer preview and dev draft.
3. Remove now-unused draft shell helpers if they only served the onboarding-style header.

### Done when

- The target dev shell contract is clearly mapped to the existing preview structure.

## Phase 2 - Replace dev header markup

### Objective

- Delete the current onboarding-style header and replace it with preview-style toolbar markup.

### Files to update

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Remove:

- progress bar
- eyebrow label
- long headline/subtitle block
- side info card

2. Add toolbar card with:

- title `Preview do template`
- template name metadata
- slug metadata
- auto-save metadata

3. Keep responsive behavior aligned with `TemplatePreview`:

- stacked buttons on small screens
- inline alignment on `sm+`

### Done when

- The rendered dev draft header matches the preview shell layout instead of the onboarding shell.

## Phase 3 - Wire actions and state labels

### Objective

- Preserve all current actions while adapting button copy to the new shell.

### Files to update

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Bind primary CTA to `handleFinalize()`.
2. Keep authenticated vs guest label switching.
3. Keep loading/disabled state during finalize.
4. Bind secondary CTA to `navigate('/profile/create/developer')`.
5. Format metadata string using:

- `getDeveloperTemplateName(draft.templateType)`
- `draft.slug`
- `lastSavedAt`

### Done when

- All existing behavior still works through the new toolbar.

## Phase 4 - Cleanup and verification

### Objective

- Remove dead code from the old header and verify no visual regressions.

### Files to update

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

### Tasks

1. Remove unused imports/helpers from the deleted shell.
2. Check mobile wrapping and spacing.
3. Run frontend build.
4. Manually validate draft route in guest and authenticated states.

### Done when

- `npm run build` passes and the toolbar is visually aligned with `TemplatePreview`.
