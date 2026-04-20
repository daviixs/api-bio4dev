# 🧪 Guia Oficial de Testes (Bio4Dev API)

Este documento centraliza todas as informações que você precisa para rodar a suíte de testes de **Integração e E2E** configuradas com NestJS, Prisma e JWT (Google OAuth).

---

## 1. O que foi construído?

Na nossa arquitetura, os testes estão divididos em duas finalidades primordiais contidas no diretório `test/`:

- **Testes de Integração (`test/integration/`)**: Validam a comunicação real entre os fluxos locais (Controller -> Service -> Prisma), isolando apenas agentes muito pesados do mundo externo (como a biblioteca do Google Console) através do uso de *Mocks* localizados. Eles atestam seguranças contra BruteForce, CSRF e manipulação livre de Tokens.
- **E2E (Ponta-a-Ponta) (`test/e2e/`)**: Valida um funil contínuo. Exemplo: um usuário loga via callback, obtém seus acessos, forja um Request de Profile, recupera informações e o sistema confere diretamente do banco final de dados a sua integridade – validando toda a viagem na aplicação real de dados sensíveis na resposta.

---

## 2. Configurando o Ambiente de Teste

Antes de rodar as baterias, você precisa garantir a integridade do seu Banco de Dados de testes usando o Prisma.
Não rode baterias de E2E apontando para o seu banco da produção real!

### 2.1 Preparo das Dependências Restantes
Se você ainda não instalou os pacotes mencionados anteriormente, rode:
```bash
npm install helmet
npm install --save-dev @faker-js/faker jsonwebtoken @types/jsonwebtoken
```

### 2.2 Variáveis de Teste (`.env.test`)
O próprio NestJS costuma se apoiar no ambiente de execução. É vital que, ao executar comandos de integração e E2E, a URL de banco aponte para um database limpo (Ex: `bio4dev-test-db`).
Se o seu Jest ainda não carregar o `.env.test` de modo invisível, o helper `app.helper.ts` utilizará proeforma os acessos presentes na string principal do Prisma se você não usar algo nativo como o `dotenv-cli`. 

Para blindar isto, utilize no Linux/Mac:
```bash
# Sobe o banco nas variáveis atuais (Isso destruiria tabelas da url atual por conta dos db-cleaners!) 
# Use preferêncialmente bancos espelhos ou sqlite temporários.
```

---

## 3. Rodando os Testes via Terminal

Neste projeto de API do Nest, o arquivo base da sua ferramenta `jest` no `package.json` direciona normalmente os testes unitários restritos estritamente ao `/src`. Para varrer os arquivos recém criados localizados na pasta base `/test`, utilizamos as configs personalizadas.

### A. Para Testar o E2E Completo 
O NestJS nativamente já injetou a regra `jest-e2e.json` para você. Para engatilhar o `full-account-flow.e2e-spec.ts`:

```bash
npm run test:e2e
```

### B. Para Testar a Integração Direta (JWT e Profiles Isolation)
Como injetamos os arquivos na estrutura `test/integration/*.spec.ts`, você pode apontar o CLI do jest diretamente para ler a raiz, superando o bloqueio primário:

```bash
npx jest --config ./test/jest-e2e.json test/integration/
```
*(O `jest-e2e.json` já engloba todo o folder `test/` por ter seu rootDir="." apontado localmente, aplicando o transpiler Typescript corretamente às camadas de Integração sem exigir uma nova CLI no package original).*

### C. Analisando Log Detalhado (Watch Mode)
Se você estiver construindo novos escopos defensivos de JWT ou resolvendo algo quebrado local:

```bash
npx jest --config ./test/jest-e2e.json --watchAll
```

---

## 4. Resolvendo Falhas Acidentais
Se um teste cair, os dados de lixo (sujeira) permanecerão no banco?
**Geralmente, não.**
Graças ao uso do módulo centralizado `cleanAll(prisma);` contido no arquivo `db-cleaner.ts`, utilizamos o hook `@afterAll()` em todas as suites que limpa o seu log de forma cascateada — protegendo chaves estrangeiras.

Em caso do teste estourar bruscamente pelo prompt do Node (SIGKill) antes de invocar o `afterAll`, basta rodar `npx prisma db push --force-reset` na base espelho do arquivo env.
