# Backend - Melhorias para Portfólio 2

## ✅ TODAS AS MELHORIAS IMPLEMENTADAS!

### 1. Campo `location` - ✅ RESOLVIDO!

**Solução:** Usando campo `subtitulo` da Legenda

### 2. Campo `tags` nos Projetos - ✅ IMPLEMENTADO!

**Mudanças aplicadas:**

- ✅ Schema Prisma atualizado
- ✅ DTOs atualizados (CreateProjetoDto e UpdateProjetoDto)
- ✅ Tipos TypeScript atualizados
- ✅ Frontend mapeando automaticamente
- ✅ Banco de dados sincronizado

### 3. Enum `Plataforma` expandido - ✅ IMPLEMENTADO!

**Novas plataformas adicionadas:**

- ✅ facebook
- ✅ figma
- ✅ devto
- ✅ email
- ✅ behance
- ✅ dribbble
- ✅ medium

---

## 🎉 PORTFÓLIO 2 ESTÁ 100% FUNCIONAL!

Todas as funcionalidades estão implementadas e funcionando:

- ✅ Profile com todas as informações
- ✅ Location (via subtitulo da Legenda)
- ✅ Social Links (com todas as plataformas)
- ✅ Work Experience
- ✅ Projects (com tags!)
- ✅ Tech Stack

---

## 🧪 COMO TESTAR

### Criar Projeto com Tags

```bash
POST http://localhost:5000/projects
{
  "profileId": "uuid-do-profile",
  "nome": "E-Commerce Dashboard",
  "descricao": "Sistema completo de analytics para e-commerce",
  "gif": "https://exemplo.com/demo.gif",
  "tags": ["React", "TypeScript", "Tailwind CSS", "Recharts"],
  "demoLink": "https://demo.com",
  "ordem": 1
}
```

### Criar Social com Novas Plataformas

```bash
POST http://localhost:5000/social
{
  "profileId": "uuid-do-profile",
  "plataforma": "figma",
  "url": "https://figma.com/@usuario",
  "ordem": 3
}

POST http://localhost:5000/social
{
  "profileId": "uuid-do-profile",
  "plataforma": "facebook",
  "url": "https://facebook.com/usuario",
  "ordem": 2
}
```

### Criar Location (via Legenda)

```bash
POST http://localhost:5000/legenda
{
  "profileId": "uuid-do-profile",
  "nome": "João Silva",
  "titulo": "Full Stack Developer",
  "subtitulo": "São Paulo, Brasil",
  "legendaFoto": "https://...",
  "descricao": "Desenvolvedor apaixonado por tecnologia"
}
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Reiniciar o backend (se estiver rodando)
2. ✅ Testar criação de projetos com tags
3. ✅ Testar novas plataformas sociais
4. ✅ Verificar frontend exibindo tudo corretamente

**Tudo pronto!** 🎉

**Solução:** Estamos usando o campo **`subtitulo`** da **Legenda** como location!

```typescript
// No frontend, já mapeado automaticamente:
location: legenda?.subtitulo || 'Location not set';
```

**Como usar:**

```bash
POST http://localhost:5000/legenda
{
  "profileId": "...",
  "nome": "João Silva",
  "titulo": "Full Stack Developer",
  "subtitulo": "São Paulo, Brasil",  # ← USE ISTO COMO LOCATION
  "legendaFoto": "url",
  "descricao": "Sua descrição completa aqui"
}
```

✅ **Nenhuma mudança necessária no backend para location!**

---

## 📋 TAREFAS RESTANTES (OPCIONAIS)

### 1️⃣ Adicionar campo `tags` aos Projetos (RECOMENDADO)

**Arquivo:** `api-bio4dev/prisma/schema.prisma`

```prisma
model Profile {
  id            String        @id @default(uuid()) @db.Uuid
  userId        String        @unique @db.Uuid
  username      String        @unique @db.VarChar(40)
  bio           String?       @db.Text
  avatarUrl     String?       @db.Text
  location      String?       @db.VarChar(100)  // ⬅️ ADICIONAR ESTA LINHA
  theme         Colors        @default(LIGHT)
  mainColor     String?       @db.VarChar(7)
  templateType  TemplateType
  published     Boolean       @default(false)
  createdAt     DateTime      @default(now())
  // ... resto do modelo
}
```

**Arquivo:** `api-bio4dev/src/dto/profiles.dto.ts`

```typescript
export class CreateProfileDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MaxLength(40)
  username: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string; // ⬅️ ADICIONAR ESTAS LINHAS

  // ... resto do DTO
}

export class UpdateProfileDto {
  // ... campos existentes

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string; // ⬅️ ADICIONAR ESTAS LINHAS
}
```

**Comando:**

```bash
cd api-bio4dev
npx prisma migrate dev --name add_location_to_profile
```

---

### 2️⃣ Adicionar campo `tags` aos Projetos

**Arquivo:** `api-bio4dev/prisma/schema.prisma`

```prisma
model Projeto {
  id        String    @id @default(uuid()) @db.Uuid
  profileId String    @db.Uuid
  nome      String
  descricao String    @db.Text
  demoLink  String?   @db.Text
  codeLink  String?   @db.Text
  ordem     Int       @default(0)
  gif       String
  tags      String[]  // ⬅️ ADICIONAR ESTA LINHA (array de strings)
  createdAt DateTime  @default(now())
  // ... resto do modelo
}
```

**Arquivo:** `api-bio4dev/src/dto/projects.dto.ts`

```typescript
export class CreateProjetoDto {
  @IsUUID()
  profileId: string;

  @IsString()
  nome: string;

  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  demoLink?: string;

  @IsOptional()
  @IsString()
  codeLink?: string;

  @IsString()
  gif: string;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // ⬅️ ADICIONAR ESTAS LINHAS
}

export class UpdateProjetoDto {
  // ... campos existentes

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // ⬅️ ADICIONAR ESTAS LINHAS
}
```

**Comando:**

```bash
cd api-bio4dev
npx prisma migrate dev --name add_tags_to_projeto
```

---

### 3️⃣ Expandir enum `Plataforma`

**Arquivo:** `api-bio4dev/prisma/schema.prisma`

```prisma
enum Plataforma {
  instagram
  tiktok
  youtube
  github
  linkedin
  twitter
  facebook   // ⬅️ ADICIONAR
  figma      // ⬅️ ADICIONAR
  devto      // ⬅️ ADICIONAR
  email      // ⬅️ ADICIONAR
  behance    // ⬅️ ADICIONAR (opcional)
  dribbble   // ⬅️ ADICIONAR (opcional)
  medium     // ⬅️ ADICIONAR (opcional)
}
```

**Arquivo:** `api-bio4dev/src/dto/social.dto.ts`

```typescript
export type PlataformaSocial =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'facebook' // ⬅️ ADICIONAR
  | 'figma' // ⬅️ ADICIONAR
  | 'devto' // ⬅️ ADICIONAR
  | 'email' // ⬅️ ADICIONAR
  | 'behance' // ⬅️ ADICIONAR (opcional)
  | 'dribbble' // ⬅️ ADICIONAR (opcional)
  | 'medium'; // ⬅️ ADICIONAR (opcional)

export class CreateSocialDto {
  @IsUUID()
  profileId: string;

  @IsEnum([
    'instagram',
    'tiktok',
    'youtube',
    'github',
    'linkedin',
    'twitter',
    'facebook',
    'figma',
    'devto',
    'email',
    'behance',
    'dribbble',
    'medium',
  ])
  plataforma: PlataformaSocial;

  // ... resto do DTO
}
```

**Arquivo:** `front-bio4dev/src/types/index.ts`

```typescript
export type PlataformaSocial =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'facebook' // ⬅️ ADICIONAR
  | 'figma' // ⬅️ ADICIONAR
  | 'devto' // ⬅️ ADICIONAR
  | 'email' // ⬅️ ADICIONAR
  | 'behance' // ⬅️ ADICIONAR (opcional)
  | 'dribbble' // ⬅️ ADICIONAR (opcional)
  | 'medium'; // ⬅️ ADICIONAR (opcional)
```

**Comando:**

```bash
cd api-bio4dev
npx prisma migrate dev --name expand_plataforma_enum
```

---

## 🔄 PROCESSO COMPLETO

### Passo a Passo (APENAS 2 MUDANÇAS)

1. **Editar Schema Prisma** (2 mudanças: tags e plataformas)
2. **Rodar Migrations**
   ```bash
   cd api-bio4dev
   npx prisma migrate dev --name add_tags_and_expand_platforms
   npx prisma generate
   ```
3. **Atualizar DTOs** (projects.dto.ts, social.dto.ts)
4. **Atualizar tipos Frontend** (src/types/index.ts)
5. **Reiniciar Backend**
   ```bash
   npm run start:dev
   ```
6. **Testar** - Criar dados via API com os novos campos

---

## ✅ CHECKLIST

- [x] ~~Location~~ - ✅ Usando `subtitulo` da Legenda (SEM MUDANÇAS!)
- [ ] Editar `prisma/schema.prisma` (2 mudanças)
- [ ] Rodar `npx prisma migrate dev`
- [ ] Rodar `npx prisma generate`
- [ ] Atualizar `src/dto/projects.dto.ts`
- [ ] Atualizar `src/dto/social.dto.ts`
- [ ] Atualizar `src/types/index.ts` (frontend)
- [ ] Reiniciar backend
- [ ] Testar criação de Projeto com tags
- [ ] Testar criação de Social com novas plataformas

---

## 🧪 TESTES

### Testar Profile com Location

```bash
POST http://localhost:5000/profile
{
  "userId": "...",
  "username": "teste",
  "location": "São Paulo, Brasil",  # NOVO CAMPO
  "templateType": "template_02"
}
```

### Testar Projeto com Tags

```bash
POST http://localhost:5000/projects
{
  "profileId": "...",
  "nome": "Meu App",
  "descricao": "App incrível",
  "gif": "url_da_imagem",
  "tags": ["React", "TypeScript", "Node.js"]  # NOVO CAMPO
}
```

### Testar Social com Novas Plataformas

```bash
POST http://localhost:5000/social
{
  "profileId": "...",
  "plataforma": "figma",  # NOVA PLATAFORMA
  "url": "https://figma.com/@usuario",
  "ordem": 1
}
```

---

## ⚠️ IMPORTANTE

- **Não precisa modificar controllers/services** - Prisma cuida automaticamente
- **Frontend já está preparado** - Vai funcionar assim que backend tiver os campos
- **Valores são opcionais** - Não quebra dados existentes
- **Tempo estimado:** 30-60 minutos

---

Após implementar estas 3 mudanças, o Portfólio 2 estará 100% funcional! 🚀
