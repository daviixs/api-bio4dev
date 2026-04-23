# Dashboard Auth Fail-Fast Design

Date: 2026-04-22

## Summary

Bug: user opens protected dashboard route and app fica presa em `"Restaurando sua sessão..."`, mesmo quando existe estado persistido de login no browser.

Observed symptoms:

- request inicial para endpoint protegido retorna `401`
- `ProtectedRoute` continua em `booting`
- frontend mistura estado persistido (`user`, `isAuthenticated`) com sessão realmente validada no servidor

Desired behavior:

- rota protegida só libera conteúdo depois de sessão real ser validada
- refresh silencioso precisa terminar sempre em `authenticated` ou `guest`
- falha de refresh deve limpar estado local e redirecionar rápido para `/profile/type`
- spinner de restauração nunca pode ficar infinito

User preference locked:

- quando restauração falhar, redirecionar para `/profile/type`
- mostrar toast `Sua sessão expirou. Entre novamente.`
- resolver de forma correta, não só esconder loading

## Current Root Cause

- `front-bio4dev/src/stores/authStore.ts` ainda trata dados persistidos como sinal suficiente para autenticação em alguns caminhos
- `authStatus: 'booting'` depende de `bootstrapAuth()` terminar, mas o fluxo atual não trata timeout e falhas de forma explicitamente fail-fast
- `ProtectedRoute` segura a UI inteira enquanto o bootstrap não resolve
- componentes protegidos acabam fazendo requests privadas cedo demais quando a sessão real ainda não foi validada

JWT/security consequence:

- estado salvo em storage não prova autenticação
- fonte de verdade para sessão protegida deve ser refresh/cookie válido no backend e, depois disso, user carregado com token válido

## Options Considered

### Option 1: Fail-fast bootstrap with timeout and explicit guest resolution

- sempre rodar `bootstrapAuth()` para rota protegida
- usar timeout no refresh
- limpar estado local em qualquer falha
- redirecionar quando resolver `guest`

Pros:

- corrige raiz do loop
- respeita modelo de segurança do JWT
- evita spinner infinito

Cons:

- pequeno refactor no store e no guard

### Option 2: Optimistic dashboard render from persisted state

- liberar dashboard enquanto refresh roda em background

Pros:

- menos loading visível

Cons:

- inseguro para rotas protegidas
- mantém risco de `401` inicial e estado inconsistente

### Option 3: Corrigir só `ProtectedRoute`

- colocar timeout visual e redirect no guard

Pros:

- diff menor

Cons:

- store continua inconsistente
- problema pode voltar em outras rotas protegidas e interceptors

## Recommendation

- escolher Option 1
- tratar bootstrap como máquina de estados curta e terminal:
  - `booting`
  - `authenticated`
  - `guest`
- não promover usuário para `authenticated` apenas porque Zustand restaurou dados antigos

## Target Behavior

### Bootstrap rules

- `bootstrapAuth()` é ponto único de resolução de sessão para rotas protegidas
- se já existe `accessToken` em memória, validar user atual antes de liberar
- se não existe `accessToken`, tentar `POST /auth/refresh` uma vez
- refresh usa timeout curto
- sucesso no refresh:
  - salvar novo `accessToken`
  - sincronizar `user`
  - resolver `authenticated`
- falha no refresh, timeout, ou falha ao sincronizar user:
  - limpar `user`, `profile`, `accessToken`, `isAuthenticated`
  - resolver `guest`

### Route guarding

- `ProtectedRoute` mostra fallback apenas enquanto bootstrap único está em voo
- quando bootstrap termina:
  - `authenticated` -> renderiza children
  - `guest` -> toast único + `<Navigate to="/profile/type" replace />`
- guest puro sem sessão restaurável não fica preso em loading

### Error handling

- falha de refresh não pode gerar loop
- toast de expiração só aparece quando houve tentativa real de restaurar sessão e ela falhou
- `/auth/callback/google` continua fora do redirect automático durante bootstrap
- requests privadas não montam antes de `authenticated`

## Public Interfaces / State Changes

- `front-bio4dev/src/stores/authStore.ts`
  - endurecer `bootstrapAuth()`
  - adicionar timeout de refresh
  - centralizar limpeza de sessão inválida
  - expor sinal suficiente para diferenciar guest limpo de sessão expirada durante bootstrap
- `front-bio4dev/src/App.tsx`
  - manter `ProtectedRoute` declarativa
  - adicionar redirect com toast único quando bootstrap falhar
- nenhum contrato backend muda

## Test Plan

1. Sessão válida com cookie refresh funcional abre `/dashboard` normalmente.
2. Sessão expirada ou cookie ausente redireciona rápido para `/profile/type`.
3. Refresh travado por rede termina por timeout e não prende spinner.
4. Guest abrindo rota protegida não entra em loop.
5. Hard refresh em `/dashboard` não mostra tela branca infinita.
6. `/auth/callback/google` continua funcionando.
7. Requests privadas não disparam antes de `authenticated`.

## Assumptions

- endpoint `/auth/refresh` já é fonte de verdade para restaurar sessão
- refresh cookie em ambiente local deve estar acessível com `credentials: 'include'`
- escopo não inclui redesenho do dashboard, só fluxo de autenticação/guard
