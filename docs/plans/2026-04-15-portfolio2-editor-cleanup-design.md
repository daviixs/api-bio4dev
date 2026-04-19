# Portfolio 2 Editor Cleanup

## Context

- The editable flow for portfolio 2 has duplicated social entry points.
- The tech stack section renders a noisy demo catalog in-page instead of using the existing add dialog as the primary control.
- Project editing has inconsistent URL handling, does not expose media input clearly, and can save local fake IDs that break later edit/delete flows.

## Approved Direction

### Socials

- Remove the secondary `Add Social Media Profiles` block from the editor.
- Keep only the existing social cards grid plus the single `Add Social` card.
- Continue using the existing dialog as the only place to add, edit, and remove social links.

### Tech Stack

- Remove the large in-page technologies list from the editor.
- Keep only the `Adicionar tecnologia` button in the page layout.
- Move add/remove management into the technology dialog itself.
- Show selected technologies inside the dialog with remove actions.
- Reflect additions and removals immediately in local state so changes appear without refresh.

### Projects

- Keep the existing project modal, but make it reliable.
- Add an explicit media URL field for gif/image input and show a preview in project cards.
- Normalize project URLs before save so inputs like `meusite.com` become `https://meusite.com`.
- Only send optional fields when they contain normalized values.
- Persist and reuse backend-returned project IDs instead of local fake IDs, so edit/delete keeps working after create.
- Map project tags from the editor field instead of dropping them.

### Validation and Feedback

- Surface field-specific validation issues instead of generic bad request failures.
- Keep the current layout direction; only remove noisy duplicated UI and fix broken behaviors.

## Validation

- Build the frontend.
- Run backend/frontend build or test commands that are available without changing setup.
- Manually verify the editor flows for socials, tech stack, and projects through code-path inspection and successful compilation.
