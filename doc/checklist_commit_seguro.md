# Checklist de Commit Seguro — Localize Sua Saúde

> Procedimento obrigatório antes de qualquer `git push`.
> Objetivo: garantir que nenhuma chave, senha ou dado sensível seja exposto.

---

## Antes de commitar

### 1. Verificar arquivos que serão enviados

```bash
git status --short          # o que mudou
git diff --staged           # conteúdo exato do commit
```

### 2. Confirmar que os segredos estão ignorados

```bash
git check-ignore api/.env frontend/.env api/db/landing.db
# Cada linha deve retornar o próprio caminho (ignorado com sucesso)
```

### 3. Varredura de segredos nos arquivos staged

```bash
# Chaves hex (formato das API keys deste projeto)
git diff --staged | grep -E "[0-9a-f]{64}"

# Senhas e tokens literais
git diff --staged | grep -inE "(senha|password|secret|token)\s*[:=]\s*['\"][A-Za-z0-9@!#]{6,}"

# Chaves privadas
git diff --staged | grep -E "BEGIN (RSA|EC|OPENSSH) PRIVATE"
```

**Se qualquer comando retornar algo: NÃO commite.** Remova o valor, mova para o `.env` e substitua no código por `process.env.NOME_DA_VARIAVEL`.

### 4. Regras de ouro

| Regra | Detalhe |
|-------|---------|
| `.env` nunca vai ao Git | Valores reais só em arquivos ignorados pelo `.gitignore` |
| `.env.example` sem valores | Templates usam `<gerar_aleatoria>` como placeholder |
| Chave admin = só backend | `API_KEY_ADMIN` jamais aparece em código frontend |
| Frontend não embute chaves | Nada de `VITE_API_KEY_*` com valores secretos |
| Banco fora do Git | `*.db`, `*-wal`, `*-shm` sempre ignorados |
| Logs fora do Git | `server.log`, `*.err` sempre ignorados |

## Gerar novas chaves (quando necessário)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Rotação recomendada: a cada 90 dias ou imediatamente se houver suspeita de vazamento.

## Se uma chave vazar

1. **Revogue imediatamente**: gere nova chave no `.env`
2. A chave antiga continua no histórico do Git — rotação é obrigatória (apagar do histórico exige `git filter-repo` + force push, quebra clones)
3. Investigue acessos anômalos no período de exposição

## Estado atual verificado (25/08/2026)

| Verificação | Status |
|-------------|--------|
| `.env` reais fora do Git | ✓ |
| Zero segredos nos arquivos rastreados | ✓ |
| Zero segredos em TODO o histórico de commits | ✓ |
| Templates `.env.example` sem valores reais | ✓ |
| Bundle JS sem chaves embutidas | ✓ |
| Permissões do banco (600/700) | ✓ |
