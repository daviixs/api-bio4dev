# Developer Draft Preview Shell Design

Date: 2026-04-20

## Summary

`DeveloperDraftEditorPage` deve abandonar o shell atual de onboarding e passar a usar o mesmo padrão visual de `TemplatePreview`.

Objetivo:

- apagar o topo atual do draft dev por completo
- espelhar o toolbar shell já usado no preview de influencer
- manter comportamento draft-first e CTA final existentes
- reduzir duplicação visual entre preview/editor flows

## Current Problem

Hoje o topo do editor draft dev mistura padrões diferentes:

- barra de progresso de onboarding
- eyebrow "Draft-first editor"
- headline explicativa longa
- card lateral de link reservado

Isso cria três problemas:

1. não bate com a referência visual já aprovada no produto
2. parece fluxo intermediário, não shell de preview/editor
3. duplica linguagem e hierarquia desnecessárias antes do template

## Approved Direction

Direção aprovada: copiar o shell de `TemplatePreview` quase `1:1`.

Referência:

- `front-bio4dev/src/pages/influencers/shared/TemplatePreview.tsx`

O topo do draft dev deve ter:

- card único horizontal
- título curto
- linha de metadados logo abaixo
- dois CTAs alinhados à direita no desktop e empilhados no mobile

## Intended UI

### Structure

Topo novo em `DeveloperDraftEditorPage`:

- wrapper com mesmo espaçamento vertical do preview
- toolbar card com largura `max-w-5xl`
- bloco esquerdo:
  - título: `Preview do template`
  - meta:
    - nome do template dev
    - `bio4.dev/{slug}`
    - `Auto-save local HH:mm`
- bloco direito:
  - CTA primário:
    - `Criar conta e salvar` para guest
    - `Salvar portfólio` para usuário autenticado
    - `Publicando...` ou `Salvando...` quando em progresso
  - CTA secundário:
    - `Trocar template`

### Content to Remove

Remover integralmente:

- `ETAPA FINAL`
- `AUTO-SAVE LOCAL` como progress label
- `DRAFT-FIRST EDITOR`
- headline "Edite tudo primeiro. Cadastro só no final."
- texto explicativo longo
- card lateral "Link reservado"
- progress bar

## Behavior

### Primary CTA

Mantém comportamento existente:

- chama `handleFinalize()`
- se guest, salva intent e abre Google auth
- se autenticado, finaliza draft e navega para dashboard

### Secondary CTA

- navega para `/profile/create/developer`
- não precisa confirmação extra nesta entrega

### Draft Metadata

Exibir no subtítulo:

- nome do template selecionado
- slug reservado
- timestamp de auto-save local

Metadados são informativos; não introduzem nova lógica.

## Visual Rules

- usar o mesmo pattern de `TemplatePreview`, não um derivado de onboarding
- evitar hero grande ou card editorial acima do template
- manter visual claro e neutro para não brigar com os templates dev
- largura, radius e alinhamento devem seguir o preview existente

## Implementation Scope

Primary file:

- `front-bio4dev/src/pages/DeveloperDraftEditorPage.tsx`

Possible secondary extraction:

- componente compartilhado de preview toolbar, se isso reduzir drift sem ampliar demais escopo

## Validation

Manual checks:

1. abrir draft dev deslogado
2. confirmar que topo agora replica shell de `TemplatePreview`
3. confirmar texto/meta corretos para template e slug
4. clicar CTA secundário e voltar para seleção de template
5. clicar CTA primário guest e iniciar auth
6. autenticar e finalizar draft
7. abrir draft autenticado e validar CTA primário em estado de salvar
