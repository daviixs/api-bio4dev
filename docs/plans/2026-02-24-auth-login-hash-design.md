# Design — Ajustes de Autenticação (hash de senha, DTOs e Swagger)

Data: 2026-02-24  
Escopo: corrigir erros em auth/users, adicionar hash de senha com bcrypt, alinhar DTOs e documentação Swagger de login/register/me/password.

## Decisões
- Criptografia de senha: usar `bcrypt` com 10 salt rounds em criação e atualização de senha; comparação no login com `compare`.
- Payload JWT: `sub` (userId), `email`, `role`; estratégia `jwt` valida e injeta o usuário sanitizado em `req.user`.
- DTOs: reutilizar `CreateUserDto`, `LoginDto`, `UpdatePasswordDto`, `UserResponseDto` de `src/dto/users.dto.ts`; remover `user.dto` antigo.
- Endpoints
  - `POST /auth/register`: cria usuário (sempre `USER` por enquanto).
  - `POST /auth/login`: retorna `access_token`, `expiresIn`, `user`.
  - `GET /users/me`: retorna usuário autenticado.
  - `PUT /users/password`: troca senha autenticada.
- Módulos/Providers: corrigir imports relativos (`../database/prisma.service`, `../dto/users.dto`), manter `UsersModule` exportando `UsersService`; `AuthModule` registra `JwtModule` com `SECRETKEY`/`EXPIRESIN`.

## Pendências/Riscos
- Campo `role` ainda não existe no banco; responses usam fallback `USER`. Precisa migration futura para suporte real a admins.
- Usuários já criados com senha em texto puro não conseguirão logar após hash; será necessário reset ou migração.
- `SECRETKEY` precisa estar definido em runtime; Strategy lança erro se ausente.
