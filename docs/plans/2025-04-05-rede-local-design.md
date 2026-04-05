# Design: Configurar Aplicação para Rede Local

**Data:** 2025-04-05  
**Objetivo:** Tornar aplicação acessível de outros computadores na rede local

## Visão Geral

Configurar aplicação bio4dev (NestJS backend + Vite frontend) para ser acessível de qualquer dispositivo na mesma rede WiFi, ao invés de apenas localhost.

## Arquitetura

**Backend (NestJS):**

- Configurar `main.ts` para escutar em `0.0.0.0:3000`
- Isso permite conexões de qualquer interface de rede (WiFi, Ethernet)
- CORS deve permitir requisições do IP da máquina

**Frontend (Vite):**

- Configurar `vite.config.ts` para usar `host: 0.0.0.0`
- Porta 4000 acessível de qualquer dispositivo na mesma rede
- API base configurável via variável de ambiente `VITE_API_URL`

**Firewall macOS:**

- Permitir conexões de entrada nas portas 3000 e 4000
- Configurar exceções no Security System Preferences

## Componentes

**Modificações no Backend:**

- `src/main.ts`: Alterar `app.listen()` para receber `0.0.0.0` como host
- Verificar configuração de CORS no NestJS para permitir o IP da máquina

**Modificações no Frontend:**

- `front-bio4dev/vite.config.ts`: Adicionar `host: '0.0.0.0'` no objeto `server`
- `front-bio4dev/.env`: Configurar `VITE_API_URL` com o IP da máquina
- Criar `front-bio4dev/.env.example` se não existir

**Configuração de Rede:**

- Obter IP local da máquina: `ipconfig getifaddr en0` (ou `en1` para outras interfaces)
- Configurar firewall do macOS via System Preferences > Security & Privacy > Firewall Options

## Fluxo de Dados

**Normal (localhost):**

1. Frontend em `localhost:4000` acessa API em `http://localhost:3000`
2. CORS permite origem localhost

**Após configuração (rede local):**

1. Dispositivo externo acessa `http://192.168.x.x:4000` (frontend)
2. Frontend faz requests para `http://192.168.x.x:3000` (API)
3. CORS configurado para permitir `http://192.168.x.x:4000`
4. Resposta retorna para dispositivo externo

**Variável de ambiente:**

- Frontend usa `VITE_API_URL` para saber onde chamar a API
- Permite alternar entre localhost e IP local sem alterar código

## Tratamento de Erros

**Possíveis erros:**

1. **Firewall bloqueando:**
   - Sintoma: Timeout/erro de conexão
   - Solução: Configurar firewall do macOS

2. **IP incorreto:**
   - Sintoma: ERR_CONNECTION_REFUSED ou similar
   - Solução: Obter IP correto com comando `ipconfig getifaddr en0`

3. **CORS bloqueando:**
   - Sintoma: Erro CORS no console do navegador
   - Solução: Configurar CORS no NestJS para permitir origem do IP local

4. **Frontend tentando acessar localhost:**
   - Sintoma: Frontend carrega mas API não responde em dispositivos externos
   - Solução: Configurar `VITE_API_URL` corretamente com IP local

## Testes

**Testes necessários:**

1. **Verificar configuração local:**
   - Testar `http://localhost:4000` ainda funciona
   - Testar `http://localhost:3000` ainda funciona

2. **Testar acesso via IP local na própria máquina:**
   - Obter IP com `ipconfig getifaddr en0`
   - Acessar `http://IP_LOCAL:4000` no navegador local
   - Verificar console para erros de rede/CORS

3. **Testar de outro dispositivo na mesma rede:**
   - Acessar `http://IP_LOCAL:4000` do dispositivo externo
   - Testar autenticação e funcionalidades principais
   - Verificar requisições de API funcionam
