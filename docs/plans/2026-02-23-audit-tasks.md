# Audit Tasks -- API Bio4Dev

**Data da auditoria**: 2026-02-23
**Stack**: NestJS 11 + Prisma 7 + PostgreSQL (Supabase)
**Overall assessment**: REQUEST_CHANGES

---

## P0 - Critical (5 itens)

- [ ] **[P0-S3] Rotacionar credenciais do banco Supabase e JWT secret**
  - Local: `.env:1-8`
  - `DATABASE_URL`, `DIRECT_URL` e `SECRETKEY` expostos no repositorio
  - Acao: rotacionar senha do banco no Supabase dashboard, gerar novo JWT secret, injetar via CI/CD

- [ ] **[P0-S4] Remover fallback `'dev-secret'` do JwtModule**
  - Local: `src/auth/auth.module.ts:18`
  - `secret: process.env.SECRETKEY ?? 'dev-secret'` permite forjar tokens se env nao estiver definida
  - Acao: remover fallback, lancar erro se `SECRETKEY` ausente (como ja faz `jwt.strategy.ts:10-12`)

- [ ] **[P0-S1] Adicionar `@UseGuards(JwtAuthGuard)` nos 12 controllers desprotegidos**
  - Local: todos controllers exceto `users.controller.ts`
  - Controllers afetados: profile, page, legenda, config, projects, social, techstack, workexperience, footer, upload, link-button
  - Acao: adicionar guard no nivel do controller; separar rotas publicas (ex: `findBySlug`) em controller dedicado ou usar decorator customizado

- [ ] **[P0-S2] Implementar ownership check em todos os services de escrita**
  - Local: todos services (profile, page, legenda, config, projects, social, techstack, workexperience, footer, link-button)
  - Todo `update`/`delete`/`create` deve validar `profile.userId === req.user.id`
  - Acao: receber `userId` do token JWT no service e checar antes de qualquer mutacao

- [ ] **[P0-S5] Proteger upload controller: auth + file size limit + MIME validation**
  - Local: `src/footer/upload.controller.ts:15-56`
  - Endpoint `POST /upload/resume` aberto, sem limite de tamanho, filtro por extensao apenas
  - Acao: adicionar `@UseGuards(JwtAuthGuard)`, `limits: { fileSize: 5 * 1024 * 1024 }`, validar magic bytes

---

## P1 - High (10 itens)

- [ ] **[P1-S6] Configurar CORS com allowlist de origins**
  - Local: `src/main.ts:10`
  - `app.enableCors()` sem parametros = wildcard
  - Acao: `app.enableCors({ origin: ['https://seudominio.com'], credentials: true })`

- [ ] **[P1-S7] Remover campo `role` do `CreateUserDto` (self-promotion)**
  - Local: `src/dto/users.dto.ts:48-55`
  - Qualquer usuario pode se registrar como `PLATFORM_ADMIN`
  - Acao: remover `role` do DTO ou forcar `USER` no `users.service.create()`

- [ ] **[P1-S8] Reduzir JWT expiration + implementar refresh token**
  - Local: `.env:2` (`EXPIRESIN="60 days"`)
  - Token roubado vale 2 meses sem possibilidade de revogacao
  - Acao: reduzir para 15-30min, criar endpoint `/auth/refresh` com refresh token rotativo

- [ ] **[P1] Instalar e configurar `helmet`**
  - Local: `src/main.ts`
  - Headers de seguranca ausentes (X-Frame-Options, HSTS, etc.)
  - Acao: `npm install helmet` e `app.use(helmet())` no bootstrap

- [ ] **[P1] Tipar `data: any` em `projects.service.ts`**
  - Local: `src/projects/projects.service.ts:12,36`
  - `CreateProject(data: any)` e `UpdateProject(id, data: any)` bypassa ValidationPipe
  - Acao: tipar com `CreateProjetoDto` / `UpdateProjetoDto`

- [ ] **[P1] Trocar `throw new Error()` por `NotFoundException`**
  - Local: `src/projects/projects.service.ts:60`
  - `throw new Error('Project not found')` retorna HTTP 500
  - Acao: `throw new NotFoundException('Projeto nao encontrado')`

- [ ] **[P1] Corrigir N+1 no `duplicateProfile`**
  - Local: `src/profile/profile.service.ts:486-611`
  - Loops sequenciais com `await prisma.*.create()` individual (~50 queries)
  - Acao: usar `createMany` onde possivel, wrapping em `$transaction`

- [ ] **[P1] Re-lancar excecao na falha de conexao ao banco**
  - Local: `src/database/prisma.service.ts:19-20`
  - `catch` faz `console.error` mas nao re-lanca; app sobe sem banco
  - Acao: adicionar `throw error` apos o log

- [ ] **[P1] Remover campos duplicados `createdAt`/`updatedAt` no model User**
  - Local: `prisma/schema.prisma:24-25` vs `28-29`
  - Definicao duplicada com defaults diferentes
  - Acao: remover linhas 28-29, manter 24-25

- [ ] **[P1] Sincronizar enum Role entre Prisma e DTOs**
  - Local: `prisma/schema.prisma:35-39` (`CLIENT/ADMIN/ROOT`) vs `src/dto/users.dto.ts:12-15` (`USER/PLATFORM_ADMIN`)
  - Autorizacao quebrada: roles nao mapeiam
  - Acao: decidir enum definitivo, atualizar schema + DTO + migration

---

## P2 - Medium (6 itens)

- [ ] **[P2] Configurar `PrismaModule` como `@Global()` com providers/exports**
  - Local: `src/database/prisma.module.ts:3`
  - Modulo vazio; `PrismaService` registrado manualmente em cada modulo (instancias duplicadas)
  - Acao: `@Global() @Module({ providers: [PrismaService], exports: [PrismaService] })`

- [ ] **[P2] Refatorar AppModule monolitico em feature modules**
  - Local: `src/app.module.ts:32-63`
  - Todos controllers/services registrados direto no AppModule
  - Acao: criar module por feature (ProfileModule, PageModule, etc.)

- [ ] **[P2] Adicionar `select` explicito em queries que buscam User (excluir `senha`)**
  - Local: todos services que fazem `findUnique` em User
  - Hash de senha pode vazar em responses
  - Acao: `select: { id: true, email: true, nome: true, role: true, ... }` (sem `senha`)

- [ ] **[P2] Adicionar paginacao em todos os `findMany`**
  - Local: todos services com endpoints de listagem
  - Sem `take/skip/cursor` = queries ilimitadas
  - Acao: parametros opcionais `page`/`limit` com defaults (ex: `limit=20`)

- [ ] **[P2] Limitar iteracoes no loop de geracao de slug**
  - Local: `src/profile/profile.service.ts:70-73`
  - `while` sem limite pode loopear indefinidamente
  - Acao: adicionar `if (counter > 100) throw new BadRequestException('...')`

- [ ] **[P2] Corrigir cast `as any` no `expiresIn`**
  - Local: `src/auth/auth.module.ts:20`
  - `(process.env.EXPIRESIN ?? '1h') as any` suprime tipo
  - Acao: validar com regex ou usar ConfigModule com schema (Joi/zod)

---

## P3 - Low (4 itens)

- [ ] **[P3] Corrigir registro engolindo excecao**
  - Local: `src/auth/auth.service.ts:27-31`
  - Catch generico retorna HTTP 200 com `success: false`
  - Acao: lancar `HttpException` com status code correto

- [ ] **[P3] Tipar `user: any` em `toResponse()`**
  - Local: `src/users/users.service.ts:100`
  - Perda de type safety
  - Acao: tipar com o modelo Prisma `User`

- [ ] **[P3] Corrigir testes quebrados**
  - Local: `src/auth/auth.controller.spec.ts` (sem providers), `test/projects.e2e-spec.ts` (importa `UserDto` inexistente)
  - Acao: adicionar providers no spec do auth, corrigir import no e2e de projects

- [ ] **[P3] Adicionar `@IsArray()` no `UpdateProjetoDto.tags`**
  - Local: `src/dto/projects.dto.ts`
  - `CreateProjetoDto` tem `@IsArray()`, mas `UpdateProjetoDto` nao
  - Acao: adicionar `@IsArray()` antes de `@IsString({ each: true })`

---

## Nao verificado nesta auditoria

- Infra/CI (GitHub Actions, deploy pipeline, env vars em producao)
- Historico de commits do `.env` (`git log --all -- .env`)
- Configs Supabase (RLS policies, pg_bouncer)
- Migrations aplicadas vs schema atual
- Rate limiting (`@nestjs/throttler` ausente)
- Logger estruturado (apenas `console.log/error`)
- Monitoramento/APM/error tracking
- `npm audit` (CVEs em dependencias)
