# Implementation Plan - Dev Template 01 Runtime Fix

## Goal

- corrigir o crash do template público `template_01`
- manter a mudança mínima e isolada

## Delivery Strategy

- tocar somente o componente público `Template01`
- não alterar editor, backend ou mapeamento de dados

## Phase 1 - Fix the missing icon import

### Objective

- eliminar o erro de runtime causado por `Github` indefinido

### Files to update

- `front-bio4dev/src/templates/Template01.tsx`

### Tasks

1. Adicionar `Github` ao import de `lucide-react`.
2. Não alterar mais nada no template além do necessário para compilar/renderizar.

### Done when

- o template não depende mais de símbolo não importado

## Phase 2 - Verify the public render path

### Objective

- confirmar que o template volta a renderizar no bundle real

### Validation

1. Rodar build do frontend.
2. Validar que o template 1 abre sem tela marrom/branca.
3. Validar que a seção de projetos continua exibindo o botão `Ver Código`.

### Done when

- build passa e o template 1 volta a abrir normalmente
