# Dev Template 01 Runtime Fix Design

Date: 2026-04-22

## Summary

Bug: perfis dev com `template_01` ficam presos em uma tela marrom/branca ao abrir o portfólio público.

Diagnóstico confirmado:

- `front-bio4dev/src/templates/Template01.tsx` usa `Github` no botão de código dos projetos
- o símbolo não está importado de `lucide-react`
- isso gera erro de runtime na renderização do template público

Objetivo:

- restaurar a renderização normal do `template_01`
- fazer uma correção mínima, sem redesenho e sem alterar fluxo de dados

User preference locked:

- escolher correção cirúrgica
- não ampliar escopo para hardening geral do template nesta entrega

## Target Change

- atualizar apenas `front-bio4dev/src/templates/Template01.tsx`
- adicionar o import correto de `Github` junto aos demais ícones de `lucide-react`
- manter intactos:
  - layout
  - cores
  - copy
  - estrutura de seções
  - payload consumido pelo template

## Validation

1. Abrir um perfil dev publicado com `template_01`
2. Confirmar que Hero, projetos e footer renderizam sem tela vazia
3. Confirmar que o botão `Ver Código` renderiza com ícone novamente
4. Rodar build do frontend para validar o bundle

## Assumptions

- a tela marrom/branca reportada é causada por esse erro de runtime específico
- não há necessidade de fallback visual adicional nesta entrega
