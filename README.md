<p align="center">
  <img src="docs/logo.svg" alt="Bio4Dev" width="96">
</p>

<h1 align="center">Bio4Dev</h1>

<p align="center"><b>Crie e publique o seu portfólio de dev em minutos, com templates prontos e preview antes de publicar.</b></p>

<p align="center">
  <a href="#instalação-local">Instalação</a> ·
  <a href="#tecnologias-utilizadas">Tecnologias</a> ·
  <a href="#exemplo-de-uso">Exemplo de uso</a> ·
  <a href="#contribuição">Contribuição</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS 11">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black" alt="React + Vite">
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL + Prisma">
</p>

## Descrição

**Bio4Dev** é uma plataforma inovadora que permite aos desenvolvedores criar, personalizar e publicar portfólios profissionais online de forma intuitiva e eficiente. Resolva o desafio de construir uma presença online impactante com templates pré-configurados, personalização avançada e integração com redes sociais, tudo em minutos.

## Funcionalidades Principais

- **🏗️ Templates Personalizáveis**: Escolha entre múltiplos templates (minimalista, criativo, corporativo) e personalize cores, temas e layouts.
- **📄 Seções Dinâmicas**: Adicione bio, projetos, experiências profissionais, stack tecnológica, redes sociais e links personalizados.
- **👀 Sistema de Preview**: Visualize portfólios antes da publicação e compartilhe previews temporários com tokens seguros (expiram em 24h).
- **🔗 Integrações**: Importe projetos do GitHub automaticamente e integre com LinkedIn, Twitter e outras plataformas.
- **📊 Analytics Básicos**: Acompanhe visualizações e engajamento dos seus portfólios.
- **🔒 Controle de Privacidade**: Publique ou mantenha portfólios privados, com autenticação robusta.
- **📱 Responsivo**: Design otimizado para desktop, tablet e mobile.

## Benefícios e Conversão

### Dor Resolvida

Resolve a dificuldade de desenvolvedores em criar portfólios profissionais sem habilidades avançadas em design, reduzindo tempo de criação e aumentando credibilidade perante recrutadores.

### Métodos de Conversão

- **CTAs Estratégicos**: Botões como "Entre em Contato" guiam visitantes para ações desejadas.
- **Personalização por Persona**: Conteúdo adaptado para recrutadores ou clientes, com prova social.
- **Fluxo Otimizado**: Formulários simples e links diretos aumentam engajamento.

### Melhorias com Vários Links

Plataformas com múltiplos links (ex: redes sociais, projetos, CTAs personalizados) melhoram métricas:

- **Engajamento**: CTR de 10-15% (vs. 2-5% em portfólios simples).
- **Conversões**: Até 20-40% de ações (contatos, compartilhamentos).
- **SEO e Viralidade**: Backlinks e compartilhamentos aumentam tráfego orgânico em 20-40%.

## Como Funciona

O Bio4Dev segue uma arquitetura cliente-servidor:

- **Backend (API)**: Construído com NestJS, gerencia usuários, perfis, projetos e autenticação. Usa PostgreSQL via Prisma ORM para persistência de dados.
- **Frontend**: Interface React com Vite, oferece editores visuais para personalização e visualização em tempo real.
- **Fluxo Básico**:
  1. Usuário cria conta e perfil.
  2. Seleciona template e personaliza conteúdo.
  3. Preview e ajustes em tempo real.
  4. Publicação gera URL única (ex: `bio4dev.com/username`).
  5. Compartilhamento e monitoramento de analytics.

| Componente         | Responsabilidade                                    |
| ------------------ | --------------------------------------------------- |
| **API NestJS**     | CRUD de perfis, autenticação JWT, geração de tokens |
| **Frontend React** | Interface de usuário, editores, previews            |
| **PostgreSQL**     | Armazenamento de dados estruturados                 |
| **Prisma**         | ORM para queries e migrations                       |

## Tecnologias Utilizadas

### Backend

- ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) **NestJS** - Framework para APIs escaláveis
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript** - Tipagem estática
- ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white) **Prisma** - ORM para PostgreSQL
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) **PostgreSQL** - Banco de dados relacional
- ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=JSON%20web%20tokens&logoColor=white) **JWT** - Autenticação segura

### Frontend

- ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React** - Biblioteca para interfaces
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) **Vite** - Build tool rápido
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript** - Tipagem
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS** - Estilização utilitária

### Ferramentas

- ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white) **Jest** - Testes unitários e e2e
- ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) **ESLint** - Linting
- ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black) **Swagger** - Documentação de API

## Pré-requisitos e Instalação

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** recomendado (com extensões TypeScript e Prettier)

### Instalação

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/yourusername/bio4dev.git
   cd bio4dev
   ```

2. **Configure o banco de dados**:
   - Crie um banco PostgreSQL local ou use um serviço em nuvem (ex: Supabase).
   - Copie `.env.example` para `.env` e configure as variáveis:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/bio4dev"
     JWT_SECRET="your-secret-key"
     ```

3. **Instale dependências do backend**:

   ```bash
   npm install
   ```

4. **Execute migrations do Prisma**:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Instale dependências do frontend**:

   ```bash
   cd front-bio4dev
   npm install
   cd ..
   ```

6. **Inicie o projeto**:
   - Backend:
     ```bash
     npm run start:dev
     ```
   - Frontend (em outro terminal):
     ```bash
     cd front-bio4dev
     npm run dev
     ```

7. **Acesse**:
   - API: `http://localhost:3000` (Swagger em `/api`)
   - Frontend: `http://localhost:5173`

## Exemplo de Uso

### Criar um Portfólio Básico

```bash
# Após iniciar o projeto, acesse o frontend
# 1. Cadastre-se ou faça login
# 2. Clique em "Criar Perfil"
# 3. Selecione um template
# 4. Adicione sua bio e projetos
# 5. Visualize e publique
```

### API - Buscar Perfil Público

```bash
curl -X GET "http://localhost:3000/profiles/username" \
  -H "accept: application/json"
```

### Gerar Token de Preview

```bash
curl -X POST "http://localhost:3000/profiles/{profileId}/preview" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. **Fork** o projeto.
2. **Crie uma branch** para sua feature: `git checkout -b feature/nova-funcionalidade`.
3. **Commit** suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`.
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`.
5. **Abra um Pull Request**.

### Diretrizes

- Siga o [Conventional Commits](https://conventionalcommits.org/).
- Mantenha cobertura de testes >80%.
- Use ESLint e Prettier para formatação.
- Documente novas APIs com Swagger.

Para dúvidas, abra uma [issue](https://github.com/yourusername/bio4dev/issues).

---

**Bio4Dev** - Construa seu portfólio, conquiste oportunidades. 🚀
