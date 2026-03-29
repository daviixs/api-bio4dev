# Plano: Docker Compose para Postgres de teste

## Contexto
- Projeto NestJS com Prisma e PostgreSQL.
- Necessidade: banco de testes dockerizado, dados efêmeros (apagados com `docker compose down -v`).
- Executar migrações automaticamente ao subir.

## Decisões
1) Banco: Postgres `17-alpine` exposto em `localhost:5432`.
2) Persistência: volume nomeado `pgdata`; removido com `docker compose down -v`.
3) Serviço de migração: contêiner `node:20-alpine` que monta o workspace, roda `npm ci --ignore-scripts`, depois `npx prisma migrate deploy` e `npx prisma generate`; depende do DB saudável.
4) Variáveis padrão: `postgres/postgres` e DB `api_bio4dev`; strings internas usam host `db`.
5) `.env.example` adicionado; `.dockerignore` para contexto enxuto.

## Fluxo de uso
- Subir e migrar: `docker compose up --build` (primeira vez) ou `docker compose up`.
- Parar e descartar dados: `docker compose down -v`.
- Rodar migração manual (se necessário): `docker compose run --rm migrate`.

## Riscos / observações
- `npm ci` dentro do contêiner de migração pode levar tempo na primeira execução.
- Bcrypt tem build nativa; uso de `--ignore-scripts` evita compilação, mas `prisma generate` ainda baixa engines.
- Se precisar de dados persistentes, trocar `down -v` por `down` simples.
