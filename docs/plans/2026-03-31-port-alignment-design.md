# Port Alignment: Frontend 4000 → Backend 3000

## Context
- Front Vite roda em http://localhost:4000.
- Axios no frontend usa `VITE_API_URL` (fallback http://localhost:3000).
- Backend NestJS sobe em `process.env.PORT ?? 3000` e CORS só aceita `http://localhost:3000` via .env atual.
- `curl -I http://localhost:3000/auth/register` retorna connection refused, indicando que o servidor não está ouvindo em 3000 ou porta ocupada.

## Decisão
- Fixar backend ouvindo na porta 3000 (`PORT=3000`).
- Atualizar CORS para aceitar 3000 e 4000 (`CORS_ORIGIN=http://localhost:3000,http://localhost:4000`).
- Manter frontend apontando para `http://localhost:3000` (já em `.env.local`).

## Ações planejadas
1) Backend: definir `PORT=3000` no `.env` (raiz) e reiniciar `npm run start:dev`.
2) Backend: garantir CORS_ORIGIN inclui 4000.
3) Checar porta livre: `lsof -i :3000 || true` e, se ocupada, parar processo conflituoso.
4) Verificar subida: `curl -I http://localhost:3000/auth/register` deve responder (200/400/404, mas não connection refused).
5) Frontend: confirmar `.env.local` com `VITE_API_URL=http://localhost:3000`; reiniciar `npm run dev -- --port 4000`.
6) Testar fluxo de signup no browser (Network tab) e validar que POST atinge `/auth/register`.

## Riscos
- Outro serviço escutando 3000 impede startup; precisa liberar a porta.
- Ambientes com proxies/VPN podem bloquear localhost cross-port.

## Testes
- Manual: `curl -I http://localhost:3000/auth/register` (espera cabeçalhos HTTP, não ECONNREFUSED).
- Manual: Signup no front deve retornar 201/200; inspeção Network sem CORS/connection refused.
