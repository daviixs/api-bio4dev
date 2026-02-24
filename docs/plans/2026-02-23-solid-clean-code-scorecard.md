# SOLID & Clean Code -- Scorecard API Bio4Dev

**Data da analise**: 2026-02-23
**Stack**: NestJS 11 + Prisma 7 + PostgreSQL (Supabase)
**Arquivos analisados**: 12 controllers, 16 services, 11 DTOs, 1 schema Prisma, modulos

---

## Score Consolidado

```
╔══════════════════════════════════════════════════════════════╗
║              SOLID & CLEAN CODE SCORECARD                   ║
╠══════════════════════════╦═══════╦══════════════════════════╣
║ Principio                ║ Score ║ Status                   ║
╠══════════════════════════╬═══════╬══════════════════════════╣
║ S - Single Responsibility║  65%  ║ Parcial                  ║
║ O - Open/Closed          ║  40%  ║ Insuficiente             ║
║ L - Liskov Substitution  ║  90%  ║ Bom (trivial)            ║
║ I - Interface Segregation║  45%  ║ Insuficiente             ║
║ D - Dependency Inversion ║  50%  ║ Parcial                  ║
╠══════════════════════════╬═══════╬══════════════════════════╣
║ SOLID (media)            ║  58%  ║                          ║
╠══════════════════════════╬═══════╬══════════════════════════╣
║ Clean Code               ║  50%  ║ Parcial                  ║
╠══════════════════════════╬═══════╬══════════════════════════╣
║ SCORE GERAL              ║  54%  ║ Precisa melhorias        ║
╚══════════════════════════╩═══════╩══════════════════════════╝
```

---

## S -- Single Responsibility (65%)

### O que esta bom

- **Controllers magros**: 11 de 12 controllers sao pura delegacao ao service, sem logica de negocio. Padrao exemplar.

### Violacoes encontradas

| Local                                                                      | Problema                                                                                          | Severidade |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| `legenda.service`, `config.service`, `page.service`, `link-button.service` | Response envelopes (`{ message: '...', data }`) construidos no service -- concern de apresentacao | MEDIUM     |
| `link-button.controller.ts:147-150`                                        | Logica de mapeamento de dados (`buttons.map(...)`) no controller                                  | LOW        |
| `profile.service.ts` (628 linhas, 14 metodos)                              | God service misturando CRUD + preview token + slug generation + duplicacao + ativacao             | HIGH       |

### Recomendacao

- Mover response envelopes para um interceptor global NestJS
- Quebrar `profile.service.ts` em: `ProfileCrudService`, `PreviewTokenService`, `ProfileDuplicationService`

---

## O -- Open/Closed (40%)

### O que esta bom

- Nenhuma chain de `switch/if` baseada em tipos ou feature flags

### Violacoes encontradas

| Local                                               | Problema                                                                                                                 | Severidade |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Todos os 10 services                                | Mesmo boilerplate CRUD reimplementado do zero em cada service. Adicionar nova entidade exige copiar-colar 100% do codigo | MEDIUM     |
| `social`, `techstack`, `legenda`, `footer` services | Padrao upsert-on-create hardcoded independentemente em cada um, sem estrategia compartilhada                             | LOW        |

### Recomendacao

- Extrair `BaseCrudService<T>` generico com `findOneOrFail`, `create`, `update`, `delete`
- Novos services herdam e so customizam logica de negocio especifica

---

## L -- Liskov Substitution (90%)

### O que esta bom

- `PrismaService extends PrismaClient` e LSP-compliant: adiciona lifecycle sem alterar comportamento base
- Nenhum override que quebre contrato

### Nota

Score alto por vacuidade -- quase nao ha hierarquias de heranca. Nao ha violacao, mas tambem nao ha merito ativo. Os 10% perdidos refletem isso.

---

## I -- Interface Segregation (45%)

### O que esta bom

- DTOs bem segmentados: `CreateXDto`, `UpdateXDto`, `XResponseDto` separados com validacoes distintas

### Violacoes encontradas

| Local             | Problema                                                                                       | Severidade |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| Todos os services | Zero interfaces definidas no projeto inteiro                                                   | MEDIUM     |
| Todos os services | Recebem `PrismaService` completo (acesso a TODAS as 18 tabelas) quando precisam de 1-2 modelos | LOW-MEDIUM |

### Recomendacao

- Criar interfaces de repository por dominio (ex: `ISocialRepository`) ou, no minimo, um `@Global()` PrismaModule funcional

---

## D -- Dependency Inversion (50%)

### O que esta bom

- Injecao via constructor em 100% dos services -- nenhum `new Service()` manual
- NestJS DI container gerencia todas as instancias

### Violacoes encontradas

| Local                  | Problema                                                           | Severidade |
| ---------------------- | ------------------------------------------------------------------ | ---------- |
| 10/10 services         | Dependem de `PrismaService` concreto, sem interface/abstraction    | MEDIUM     |
| `prisma.service.ts:10` | Le `process.env.DATABASE_URL` direto no constructor                | MEDIUM     |
| `prisma.service.ts:5`  | `import 'dotenv/config'` -- side effect de infra dentro de service | LOW-MEDIUM |
| `auth.module.ts:18`    | Le `process.env.SECRETKEY` direto, sem `ConfigService`             | MEDIUM     |

### Recomendacao

- Usar `@nestjs/config` com `ConfigService` para todas as leituras de env
- Considerar interfaces de repository para desacoplar do Prisma

---

## Clean Code (50%)

### Naming -- 30%

| Problema                                   | Exemplos                                                                                                             | Severidade |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| Mistura sistematica PT/EN no mesmo arquivo | `plataforma`, `ordem`, `titulo` ao lado de `greeting`, `copyrightName`, `madeWith`                                   | HIGH       |
| Diretorio com typo                         | `src/workexperince/` (falta 'e') vs classe `WorkexperinceController`                                                 | HIGH       |
| 3 convencoes de naming de metodos          | `create`/`findAll` vs `createWorkExperience`/`deleteWorkExperience` vs `getTechStackByProfile`/`deleteTechStackById` | MEDIUM     |
| Mensagens de erro em 2 idiomas             | `'Rede social nao encontrada'` vs `'TechStack with ID ${id} not found'`                                              | MEDIUM     |

### Funcoes curtas -- 70%

| Metodo                                        | Linhas | Severidade |
| --------------------------------------------- | ------ | ---------- |
| `profile.service.duplicateProfile`            | 188    | HIGH       |
| `workexperience.service.updateWorkExperience` | 45     | MEDIUM     |
| `footer.service.create`                       | 38     | MEDIUM     |
| `social.service.create`                       | 35     | MEDIUM     |
| Demais metodos                                | <30    | OK         |

### DRY (sem repeticao) -- 35%

| Problema                                                        | Ocorrencias                               | Severidade |
| --------------------------------------------------------------- | ----------------------------------------- | ---------- |
| Padrao `findOrFail` (find + if !entity throw NotFoundException) | ~15 vezes em todos os services            | MEDIUM     |
| Footer field mapping (9 campos listados explicitamente)         | 3x no mesmo arquivo (`footer.service.ts`) | HIGH       |
| Response envelopes `{ message, data }`                          | 4 services                                | MEDIUM     |
| Boilerplate CRUD completo copiado                               | 10 services                               | MEDIUM     |

### Error Handling -- 40%

| Problema                                                     | Local                     | Severidade |
| ------------------------------------------------------------ | ------------------------- | ---------- |
| Excecao de conexao DB engolida (app sobe sem banco)          | `prisma.service.ts:19-20` | HIGH       |
| `throw new Error()` ao inves de `NotFoundException`          | `projects.service.ts:60`  | HIGH       |
| Catch generico retorna HTTP 200 com `success: false`         | `auth.service.ts:27-31`   | MEDIUM     |
| Nenhum tratamento de erros Prisma especificos (P2025, P2002) | Todos services            | MEDIUM     |
| Sem global exception filter                                  | Projeto inteiro           | MEDIUM     |

### HTTP Semantics -- 60%

| Problema                                   | Local                                                        | Severidade |
| ------------------------------------------ | ------------------------------------------------------------ | ---------- |
| POST usado para operacoes de leitura (GET) | `legenda.controller`, `config.controller`, `page.controller` | HIGH       |
| 3 padroes diferentes de retorno em DELETE  | Mensagem / entidade deletada / 204 No Content                | MEDIUM     |
| `204 No Content` usado corretamente        | `techstack.controller`, `workexperience.controller`          | BOM        |

### Magic Values -- 65%

| Valor                                          | Local                   | Severidade      |
| ---------------------------------------------- | ----------------------- | --------------- |
| `ordem ?? 0` (default nao nomeado)             | Multiplos services      | LOW             |
| `'https://api.dicebear.com/7.x/avataaars/svg'` | `legenda.service.ts:38` | MEDIUM          |
| `'dev-secret'` fallback                        | `auth.module.ts:18`     | HIGH (security) |
| `3` (limite de portfolios hardcoded)           | `profile.service.ts:60` | LOW             |

### Formatting/Consistency -- 75%

- Prettier configurado e aplicado
- Indentacao e estilo de imports consistentes
- Decorators organizados de forma legivel

---

## Praticas positivas encontradas

1. **Controllers magros** -- 11/12 sao pura delegacao. Disciplina excelente.
2. **DI consistente** -- Nenhum `new Service()` em lugar nenhum.
3. **Swagger completo** -- Todos os endpoints documentados com types, exemplos e descricoes. `social.controller` e particularmente rico.
4. **DTOs separados** -- Create/Update/Response com class-validator em todos os inputs.
5. **ValidationPipe global** -- `whitelist`, `forbidNonWhitelisted`, `transform` configurados.
6. **Upsert semantics** -- Social, techstack, legenda e footer criam-ou-atualizam em vez de falhar. Boa UX para o frontend.
7. **`$transaction` em `setActiveProfile`** -- Uso correto de transacao atomica.
8. **Conflict detection em social updates** -- Verifica unicidade de plataforma excluindo o registro atual (`id: { not: id }`).

---

## Plano de melhoria: de 54% para ~70%

| #   | Acao                                                                           | Impacto estimado               | Esforco |
| --- | ------------------------------------------------------------------------------ | ------------------------------ | ------- |
| 1   | Padronizar naming (EN para codigo, PT para mensagens user-facing)              | Clean Code 30% -> 60%          | 2-3h    |
| 2   | Extrair `BaseCrudService<T>` com `findOneOrFail`, eliminar ~15 repeticoes      | OCP 40% -> 60%, DRY 35% -> 55% | 3-4h    |
| 3   | Criar `@Global()` PrismaModule funcional + considerar interfaces de repository | ISP 45% -> 60%, DIP 50% -> 65% | 2-3h    |
| 4   | Mover response envelopes para interceptor global                               | SRP 65% -> 80%                 | 1-2h    |
| 5   | Usar `@nestjs/config` com `ConfigService` ao inves de `process.env` direto     | DIP 50% -> 65%                 | 1h      |

**Esforco total estimado: 1-2 dias de trabalho focado.**
