# Auditoria de Autenticação — Localize Sua Saúde

> Varredura completa de falhas de autenticação e exposição de segredos.
> Data: 25/08/2026

---

## FALHAS ENCONTRADAS E CORREÇÕES

### A1. CRÍTICA — Comparação de chave vaza o tamanho da chave (timing attack)
**Arquivo:** `api/src/utilitarios/autenticacao.js:11`
**Falha:** `comparacaoSegura` retorna imediatamente quando os tamanhos diferem. Medindo tempos de resposta, um atacante descobre o comprimento exato da chave.
**Correção:** Usar `crypto.timingSafeEqual` sobre hashes SHA-256 — tempo uniforme independente da entrada.

### A2. CRÍTICA — Servidor sobe mesmo sem chaves configuradas
**Arquivo:** `api/src/server.js`
**Falha:** Se `API_KEY_PUBLICA` ou `API_KEY_ADMIN` estiverem ausentes/curtas no `.env`, o servidor inicia normalmente e fica indefinidamente aberto ou nega tudo sem explicação.
**Correção:** Validação fail-fast no startup: servidor se recusa a iniciar se chaves não tiverem mínimo de 32 caracteres hex.

### A3. ALTA — Fallback de estáticos expõe o código-fonte inteiro
**Arquivo:** `api/src/app.js:24-25`
**Falha:** Quando `frontend/dist/` não existe, o Express serve a pasta raiz `frontend/` — expondo `vite.config.js`, `package.json`, `src/` completo.
**Correção:** Servir SOMENTE `dist/`. Sem build, responder página de aviso em vez de vazar fontes.

### A4. ALTA — Arquivos WAL/SHM do SQLite com permissões frouxas
**Arquivo:** `api/db/landing.db-wal` e `.db-shm`
**Falha:** O `chmod 600` só era aplicado ao `.db` principal na criação. Os arquivos `-wal`/`-shm` (que contêm os MESMOS dados) ficavam `rw-rw-r--`, legíveis por qualquer usuário da máquina.
**Correção:** `process.umask(0o077)` no início do processo + chmod nos três arquivos após inicialização.

### A5. ALTA — Chave pública embutida no bundle do navegador
**Arquivo:** `frontend/src/servicos/apiCliente.js` + `frontend/.env`
**Falha:** Qualquer visitante extrai `VITE_API_KEY_PUBLICA` do JS servido (DevTools → Sources). A chave "secreta" é pública na prática.
**Correção:** Remover a chave do frontend. Proteger o POST por validação de `Origin` contra lista permitida no `.env` (`ORIGENS_CONFIAVEIS`). A `API_KEY_ADMIN` continua exigida no GET (nunca vai ao navegador).

### A6. MÉDIA — Segredos mortos no `.env` (superfície de ataque inútil)
**Arquivo:** `api/.env`
**Falha:** `ADMIN_EMAIL`, `ADMIN_SENHA`, `JWT_SECRETO`, `CHAVE_SESSAO`, `CHAVE_CRIPTO_BANCO`, `VIACEP_URL`, `LOG_*` estão definidos mas NENHUM é usado pelo sistema. Senha real de admin parada em arquivo sem função.
**Correção:** Remover tudo que não é consumido por código. O `.env` passa a conter apenas variáveis vivas.

### A7. MÉDIA — dotenv carregado 3x em ordem frágil
**Arquivos:** `server.js`, `autenticacao.js`, `rateLimit.js`
**Falha:** Cada módulo carrega dotenv por conta própria. Se a ordem de import mudar, `process.env` pode ser lido antes do `.env` carregar (chaves `undefined`).
**Correção:** Carregar dotenv UMA vez, primeira linha do `server.js`, antes de qualquer outro require. Módulos apenas leem `process.env`.

### A8. MÉDIA — Sem trava anti-brute-force nas tentativas de autenticação
**Arquivo:** `api/src/utilitarios/autenticacao.js`
**Falha:** O rate limit geral (100/15min) permite ~9.600 palpites de chave/dia por IP. Não há contador dedicado para falhas de auth.
**Correção:** Limiter estrito separado: 10 falhas de autenticação por IP/15min → bloqueio.

### A9. BAIXA — CSP desabilitada no Helmet
**Arquivo:** `api/src/app.js:12-14`
**Falha:** `contentSecurityPolicy: false` remove proteção XSS do navegador.
**Correção:** Manter desabilitada apenas porque o bundle inline do Vite exige (documentado); risco aceito para ambiente acadêmico local.

---

## Estado do .env após correção (apenas variáveis vivas)

```env
PORT=3000
ORIGEM_PERMITIDA=http://localhost:3000     # CORS
ORIGENS_CONFIAVEIS=...                     # validação de Origin do POST
API_KEY_PUBLICA=<64 hex>                   # máquina-a-máquina (escrita)
API_KEY_ADMIN=<64 hex>                     # leitura administrativa
RATE_LIMIT_JANELA_MS=900000
RATE_LIMIT_MAX_REQUISICOES=100
```

Removidos: ADMIN_SENHA, ADMIN_EMAIL, JWT_SECRETO, CHAVE_SESSAO, CHAVE_CRIPTO_BANCO, VIACEP_URL, LOG_NIVEL, LOG_ARQUIVO, NODE_ENV (não usado), DB_WAL (hardcoded), DB_NOME/DB_DIRETORIO (hardcoded com valores seguros).

## Riscos residuais documentados

| Risco | Mitigação aplicada | Residual |
|-------|--------------------|----------|
| HTTP sem TLS em rede local | — | Chaves trafegam em claro na LAN; usar HTTPS em produção |
| Rate limit em memória | Reinicia no restart; suficiente p/ acadêmico | Usar Redis em produção multi-instância |
| IP compartilhado atrás de proxy | `trust proxy` permanece OFF (evita spoof de X-Forwarded-For) | Configurar explicitamente quando houver proxy real |
