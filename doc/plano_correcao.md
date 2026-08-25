# Plano de Correção — Localize Sua Saúde

> Auditoria realizada em 25/08/2026. Todos os erros categorizados por severidade.

---

## CRÍTICO (7 itens) — Corrigir imediatamente

### C1. `cadastrarLead` sem tratamento de erro — `api/src/controladores/leadControlador.js:9-12`
**Problema:** Se o banco falhar (disco cheio, corrupção), exceção não tratada derruba o servidor inteiro.
**Correção:** Envolver `banco.prepare().run()` em `try/catch` e retornar 500.

### C2. `listarLeads` sem tratamento de erro — `api/src/controladores/leadControlador.js:23-24`
**Problema:** Mesmo issue — `banco.prepare().get()` e `.all()` podem lançar exceção.
**Correção:** Envolver em `try/catch` e retornar 500.

### C3. Sem handler global de erros — `api/src/server.js`
**Problema:** Nenhum `process.on('uncaughtException')` ou `process.on('unhandledRejection')`. Erros não tratados matam o processo silenciosamente.
**Correção:** Adicionar handlers de `uncaughtException` e `unhandledRejection` no server.js.

### C4. `res.sendFile` sem `.catch()` — `api/src/app.js:35`
**Problema:** Se `index.html` não existir ou for inacessível, lança exceção não tratada.
**Correção:** Adicionar `.catch()` ou middleware de erro Express.

### C5. CORS wildcard `*` em produção — `api/.env:2` + `api/src/app.js:15`
**Problema:** Qualquer domínio pode fazer requisições cross-origin. Risco de segurança.
**Correção:** Configurar origens permitidas específicas no `.env`.

### C6. Dependência morta `sql.js` — `api/package.json:16`
**Problema:** `sql.js` listada como dependência mas nunca importada. Só `better-sqlite3` é usado. Espaço desperdiçado e superfície de ataque.
**Correção:** Remover `sql.js` do `package.json`.

### C7. `concurrently` não instalado — `package.json` raiz
**Problema:** Script `npm run dev` usa `concurrently` mas não está nas dependências. Crash imediato ao executar.
**Correção:** Remover script `dev` que depende de `concurrently` ou adicionar como devDependency.

---

## AVISO (9 itens) — Corrigir em breve

### W1. CSP desabilitado — `api/src/app.js:12-14`
**Problema:** `contentSecurityPolicy: false` remove proteção XSS.
**Correção:** Configurar CSP básica para produção.

### W2. Sem rate limiting no POST `/api/leads`
**Problema:** Atacante pode inundar o endpoint, enchendo o banco.
**Correção:** Adicionar limite de requisição por IP.

### W3. `limite` query sem limite superior — `api/src/controladores/leadControlador.js:20`
**Problema:** `?limite=999999999` despeja o banco inteiro numa query.
**Correção:** Limitar `limite` a no máximo 100.

### W4. Paginação com valores negativos — `api/src/controladores/leadControlador.js:19-21`
**Problema:** `?pagina=-5` gera offset negativo. SQLite interpreta como 0, mas é logicamente incorreto.
**Correção:** Garantir `Math.max(1, pagina)` e offset >= 0.

### W5. Endpoint `GET /api/leads` sem autenticação — `api/src/rotas/leadRotas.js:6`
**Problema:** expõe dados pessoais (nomes, emails, telefones) sem autenticação.
**Correção:** Adicionar middleware de autenticação (futuro).

### W6. `.env` carregado 3 vezes — `app.js`, `server.js`, `conexaoBanco.js`
**Problema:** Redundante. Deve carregar uma vez no entry point.
**Correção:** Remover `require('dotenv').config()` de `app.js` e `conexaoBanco.js`, manter só em `server.js`.

### W7. Sem validação de `process.env`
**Problema:** Variáveis de ambiente ausentes ou com typo silenciosamente usam defaults.
**Correção:** Validar variáveis obrigatórias no startup.

### W8. Sem graceful shutdown — `api/src/server.js:10`
**Problema:** Sem handler `SIGTERM`/`SIGINT`. Conexões são dropadas abruptamente.
**Correção:** Adicionar handlers de shutdown limpo.

### W9. Toast sem atributos ARIA — `frontend/src/components/Toast.jsx:18-23`
**Problema:** Sem `role="alert"` nem `aria-live`. Leitores de tela não anunciam. Viola WCAG.
**Correção:** Adicionar `role="alert"` e `aria-live="assertive"`.

---

## INFORMAÇÃO (11 itens) — Melhorias opcionais

### I1. `Beneficios.jsx:49` — Index como key
Usar `item.titulo` como key seria mais semântico.

### I2. `noValidate` no formulário — `FormularioLead.jsx:85`
Desabilita validação nativa do browser. Intencional, mas perde feedback inline.

### I3. Favicon ausente — `frontend/index.html`
Sem `<link rel="icon">`. Browser requisita `/favicon.ico` e recebe `index.html`.

### I4. Meta description ausente — `frontend/index.html`
Sem `<meta name="description">`. Issue menor de SEO.

### I5. Import `React` desnecessário em todos os `.jsx`
React 17+ com novo JSX transform não precisa de `import React`. Código morto.

### I6. Ano hardcoded no Footer — `Footer.jsx:31`
`2026` hardcoded. Usar `new Date().getFullYear()`.

### I7. `fetch` sem `AbortController` — `FormularioLead.jsx:35`
Se o usuário navegar away durante request, handler dispara em componente desmontado.

### I8. Sem handler 404 para rotas API desconhecidas
Rotas `/api/*` não encontradas caem no catch-all e retornam `index.html`.

### I9. Build pode estar desatualizado — `frontend/dist/`
`dist/` pode ter artefatos de build anterior. Rebuild necessário.

### I10. `conexaoBanco.js` carrega dotenv com path relativo frágil
`path.resolve(__dirname, '../../.env')` funciona mas é frágil se estrutura mudar.

### I11. Sem Error Boundary no React
Se qualquer componente throw durante render, app inteira crasha tela branca.

---

## Ordem de Execução

| # | Item | Severidade | Arquivo |
|---|------|-----------|---------|
| 1 | C1 + C2: try/catch nos controladores | Crítico | leadControlador.js |
| 2 | C3: Handler global de erros | Crítico | server.js |
| 3 | C4: catch no sendFile | Crítico | app.js |
| 4 | C5: Configurar CORS | Crítico | .env |
| 5 | C6: Remover sql.js | Crítico | package.json |
| 6 | C7: Fix script dev | Crítico | package.json (raiz) |
| 7 | W3+W4: Validar paginação | Aviso | leadControlador.js |
| 8 | W6: dotenv uma vez só | Aviso | app.js, conexaoBanco.js |
| 9 | W9: ARIA no Toast | Aviso | Toast.jsx |
| 10 | I6: Ano dinâmico no Footer | Info | Footer.jsx |
| 11 | I3: Favicon placeholder | Info | index.html |
| 12 | I8: Handler 404 API | Aviso | app.js |
| 13 | Rebuild frontend | Info | frontend/dist/ |
