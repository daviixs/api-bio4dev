# Implementation Plan - Dashboard Auth Fail-Fast

## Goal

- eliminar spinner infinito de `"Restaurando sua sessão..."`
- impedir `401` inicial causado por sessão local não validada
- resolver rota protegida sempre para `authenticated` ou `guest`

## Delivery Strategy

- corrigir store de auth primeiro
- ajustar guard para reagir ao novo estado terminal
- validar com build do frontend

## Phase 1 - Harden auth bootstrap

### Objective

- fazer `bootstrapAuth()` terminar de forma determinística e segura

### Files to update

- `front-bio4dev/src/stores/authStore.ts`

### Tasks

1. Adicionar helper interno para limpar sessão inválida de maneira centralizada.
2. Parar de considerar `user`/`isAuthenticated` persistidos como prova suficiente de autenticação.
3. Colocar timeout curto no `refreshAccessToken()`.
4. Garantir que `bootstrapAuthPromise` sempre resolve em `authenticated` ou `guest`.
5. Sincronizar `user` após refresh e cair para `guest` se essa sincronização falhar.
6. Expor estado suficiente para distinguir guest limpo de sessão expirada durante bootstrap.

### Done when

- bootstrap nunca fica preso em `booting`
- sessão inválida sempre é limpa

## Phase 2 - Make protected routing fail-fast

### Objective

- impedir loading infinito e redirect silencioso confuso

### Files to update

- `front-bio4dev/src/App.tsx`

### Tasks

1. Ajustar `ProtectedRoute` para disparar bootstrap uma vez por hidratação.
2. Mostrar fallback só enquanto bootstrap em voo.
3. Exibir toast único de sessão expirada quando bootstrap falhar após tentativa de restauração.
4. Redirecionar para `/profile/type` quando auth resolver `guest`.
5. Manter exceção atual para `/auth/callback/google`.

### Done when

- rota protegida nunca fica presa em loading
- usuário com sessão expirada recebe feedback claro

## Phase 3 - Verify protected flows

### Objective

- confirmar que dashboard e callback continuam íntegros

### Validation

1. Rodar build do frontend.
2. Validar acesso em `/dashboard` com sessão válida.
3. Validar redirect com toast em sessão expirada.
4. Validar que guest real não entra em loop.
5. Validar que callback Google não é quebrado.

### Done when

- build passa
- fluxo protegido fica consistente em hard refresh e sessão expirada
