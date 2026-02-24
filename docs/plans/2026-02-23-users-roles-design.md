# Design — DTO de Usuário com Roles

Data: 2026-02-23  
Escopo: atualizar DTOs de usuário e corrigir imports do módulo de usuários, adicionando campo de papel (role) alinhado ao restante dos DTOs.

## Decisões
- Modelo de papéis: enum fixo `UserRole` com valores `USER` e `PLATFORM_ADMIN`.
- Criação: `CreateUserDto` aceita role opcional, mas o service força `USER` para evitar auto-elevação.
- Atualização: `UpdateUserDto` permite alterar role (para uso futuro via painel admin).
- Resposta: `UserResponseDto` sempre devolve `role`.
- Imports do módulo de usuários passam a ser relativos para evitar falhas em tempo de execução quando compilado para `dist`.

## Ajustes a implementar
- Renomear `UserDto` para `CreateUserDto`; manter `LoginDto` e `UpdateUserDto`.
- Adicionar enum `UserRole` em `src/dto/users.dto.ts` e incluir `role` em create/update/response.
- No `UsersService`, usar caminhos relativos, garantir retorno com `role: USER` e tipar com `UserResponseDto`.
- No `UsersController`, ajustar imports e decorators (`ApiBody`) para `CreateUserDto`.

## Riscos / Pendências
- Campo `role` ainda não existe no schema Prisma; por enquanto o valor retornado é constante (`USER`). Para suporte real a admins, será necessário:
  - adicionar coluna `role` no modelo `User` no Prisma,
  - criar migration,
  - ajustar autenticação/authorization para ler o campo real.

