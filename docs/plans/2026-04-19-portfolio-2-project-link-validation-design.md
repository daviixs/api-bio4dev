# Portfolio 2 Project Link Validation Design

## Context

`portfolio2` project editor still fails when user edits project links for dev template.

Observed errors:

- frontend logs `Error saving project`
- backend returns `"Demo link deve ser uma URL valida"`

Current editor already attempts URL normalization, but desired behavior is broader:

- accept raw public domains like `meusite.com/projeto`
- accept local hosts like `localhost:4000`
- accept private/LAN hosts like `192.168.0.10:5173`
- keep rejecting malformed garbage input

## Goal

Make `portfolio2` project links save reliably for both public and local/private URLs during create and edit.

## Scope

Frontend:

- `front-bio4dev/src/components/portfolio/EditablePortfolio2.tsx`

Backend:

- `src/dto/projects.dto.ts`
- optional `src/projects/projects.service.ts` only if extra normalization is needed server-side

No DB/schema change.

## Chosen Approach

Use full fix across frontend and backend.

### Frontend

- keep existing project modal fields
- normalize URLs before API call
- if missing protocol:
  - public-looking host -> prepend `https://`
  - local/private host -> prepend `http://`
- send normalized `demoLink` and `codeLink` for both create and edit
- keep empty fields empty
- show clear toast before API call for invalid values

### Backend

- relax project link validation to accept normalized local/private hosts too
- keep server-side validation in place
- still reject malformed URLs

## Rejected Alternatives

1. Frontend-only fix
   - backend remains rejection source
   - inconsistent behavior

2. Backend-only fix
   - poorer UX
   - editor still sends messy/unhelpful values

## URL Rules

Accepted examples:

- `meusite.com/projeto`
- `https://meusite.com/projeto`
- `localhost:4000/demo`
- `http://localhost:4000/demo`
- `127.0.0.1:5173`
- `192.168.0.10:5173/app`
- private hostnames if valid after normalization

Rejected examples:

- `abc`
- `http://`
- `://broken`

## Behavior

On save:

1. trim input
2. normalize missing protocol
3. validate normalized result
4. if invalid, show field-specific toast and stop before request
5. if valid, send normalized values to API
6. backend validates normalized values again

## Error Handling

Frontend toast messages should be direct:

- `Demo link inválido`
- `Code link inválido`

Backend should still protect persistence if malformed data somehow bypasses frontend.

## Success Criteria

- editing existing project no longer throws `"Demo link deve ser uma URL valida"` for supported local/public URLs
- create flow and edit flow behave same
- raw domains auto-save as normalized URLs
- localhost and LAN/private IP URLs save
- malformed strings still fail

## Verification

Manual QA:

1. edit project in `portfolio2`
2. save `meusite.com/projeto` in demo field
3. save `localhost:4000/demo` in demo field
4. save `192.168.0.10:5173/app` in demo field
5. save GitHub/code field with raw domain
6. confirm no validation error for supported inputs
7. confirm broken text still rejected
