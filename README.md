# Localize Sua Saúde

Plataforma full stack para localização de unidades de saúde na região do Vale do Araguaia, desenvolvida como projeto acadêmico para a matéria de Projeto e Desenvolvimento de Sistemas.

**Matéria:** Projeto e Desenvolvimento de Sistemas — 3º Ano A, Informática  
**Professor:** Carlos David  

**Equipe:**
- Hemily Gouveia
- Daniel Reges
- Beatriz Telles
- Marcela Oliveira

**Região Alvo:** Barra do Garças (MT), Pontal do Araguaia (MT) e Aragarças (GO)  
**Versão:** 3.0  

---

## Visão Geral

O sistema **Localize Sua Saúde** resolve a descentralização e a falta de visibilidade digital dos serviços de saúde na região do Vale do Araguaia. A plataforma reunirá hospitais, clínicas e laboratórios em um único ambiente digital, oferecendo busca interativa, localização georreferenciada, consulta de medicamentos, agendamento de consultas e avaliações comunitárias — com atenção especial à acessibilidade para idosos.

---

## Funcionalidades Implementadas

### Acessibilidade (RF06 / RNF01)
- **Modo Idoso:** Amplia fontes e elementos interativos para facilitar o uso por idosos
- **Alto Contraste:** Alterna esquema de cores para melhorar legibilidade
- **Controle de Fonte (A+ / A-):** Ajusta o tamanho da fonte em 6 níveis
- **Persistência:** Preferências salvas no `localStorage` e restauradas automaticamente

### Busca e Filtragem (RF01)
- **Busca por texto:** Pesquisa por nome, especialidade ou cidade
- **Busca por CEP:** Integração com ViaCEP API para buscar endereço e redirecionar
- **Máscara de CEP:** Formatação automática do campo CEP (00000-000)
- **4 Filtros:** Cidade, Tipo (Hospital/Clínica/Laboratório/UBS), Atendimento (SUS/Particular/Convênio), Especialidade

### Geolocalização (RF02 / US01)
- **GPS:** Botão "Usar minha localização" captura coordenadas via `navigator.geolocation`
- **Status:** Feedback visual do estado da geolocalização

### Autenticação e Segurança (RF08)
- **Login/Cadastro:** Autenticação por e-mail e senha com perfis (cidadao, atendente, gestor)
- **Token HMAC-SHA256:** Sessões assinadas com chave secreta (24h de expiração)
- **Middleware:** Todas as rotas `/api/*` protegidas com validação de token
- **Proteção de Rotas:** userId extraído do token validado no servidor (não mais do cliente)
- **Cadastro Seguro:** Perfil forçado como `cidadao` no servidor (impede escalada de privilégio)

### Agendamento de Consultas
- **Agendar:** Seleção de unidade, especialidade, data e horário disponível
- **Meus Agendamentos:** Listagem e cancelamento de consultas
- **Avaliações:** Notas de 1 a 5 estrelas para unidades de saúde

### Navegação
- **Navbar funcional:** Links reais para Início, Unidades de Saúde, Medicamentos, Agendamento
- **Botão Login:** Acesso ao sistema de autenticação

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 14 |
| Frontend | React + TypeScript + Tailwind CSS | React 18 |
| Backend | Next.js API Routes | - |
| Banco de Dados | SQLite (sql.js via WASM) | sql.js 1.14 |
| Segurança | Middleware + HMAC-SHA256 tokens | - |
| API Externa | ViaCEP (consulta de CEP) | - |

---

## Estrutura do Projeto

```
localizesuasaude/
├── app/                              # Next.js App Router
│   ├── api/                          # API Routes (backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST /api/auth/login
│   │   │   └── cadastro/route.ts     # POST /api/auth/cadastro
│   │   ├── agendamentos/
│   │   │   ├── route.ts              # GET/POST /api/agendamentos
│   │   │   └── [id]/route.ts         # DELETE /api/agendamentos/:id
│   │   └── avaliacoes/route.ts       # POST /api/avaliacoes
│   ├── agendamento/page.tsx          # Página de agendamento
│   ├── cadastro/page.tsx             # Página de cadastro
│   ├── hospitais/page.tsx            # Listagem de unidades
│   ├── login/page.tsx                # Página de login
│   ├── medicamentos/page.tsx         # Consulta de medicamentos
│   ├── components/                   # Componentes React
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── AccessibilityBar.tsx
│   ├── layout.tsx                    # Layout raiz
│   ├── page.tsx                      # Página inicial
│   └── globals.css                   # Estilos globais
├── lib/                              # Bibliotecas compartilhadas
│   ├── auth.ts                       # Criação e verificação de tokens HMAC
│   └── db.ts                         # Camada de banco de dados SQLite
├── middleware.ts                      # Middleware de autenticação (Next.js)
├── .env.example                      # Variáveis de ambiente (template)
├── next.config.mjs                   # Configuração do Next.js
├── package.json                      # Dependências e scripts
└── tsconfig.json                     # Configuração TypeScript
```

---

## Instalação e Configuração

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- npm (v9 ou superior)

### 1. Clonar o repositório

```bash
git clone https://github.com/danieeee3344/localize-sua-saude.git
cd localize-sua-saude
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o `.env.example` para `.env` e configure a chave secreta:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
AUTH_SECRET=sua_chave_secreta_aqui_troque_em_producao
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **IMPORTANTE:** O arquivo `.env` está no `.gitignore` e nunca deve ser commitado.

---

## Execução

### Modo Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Modo Produção

```bash
npm run build
npm start
```

---

## API

### Endpoints Públicos (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/login` | Autenticar usuário (retorna token) |
| `POST` | `/api/auth/cadastro` | Cadastrar novo usuário |

### Endpoints Protegidos (requer `Authorization: Bearer <token>`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/agendamentos` | Listar agendamentos do usuário logado |
| `POST` | `/api/agendamentos` | Criar novo agendamento |
| `DELETE` | `/api/agendamentos/:id` | Cancelar agendamento |
| `POST` | `/api/avaliacoes` | Criar avaliação para una unidade |

### Exemplo: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cidadao@teste.com", "senha": "123456"}'
```

**Resposta:**
```json
{
  "ok": true,
  "usuario": { "id": 1, "nome": "Maria Silva", "email": "cidadao@teste.com", "perfil": "cidadao" },
  "token": "eyJhbGciOi..."
}
```

### Exemplo: Criar Agendamento (com token)

```bash
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"unidade": "UBS Central", "especialidade": "Clínico Geral", "data": "2025-01-15", "horario": "09:00", "paciente": "Maria Silva"}'
```

---

## Banco de Dados

SQLite via sql.js (WebAssembly), persistido em `data/lss.db`.

### Tabelas

```sql
-- Usuários
CREATE TABLE usuarios (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT    NOT NULL,
  email     TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  senha     TEXT    NOT NULL,
  perfil    TEXT    NOT NULL DEFAULT 'cidadao',
  criado_em TEXT    DEFAULT (datetime('now'))
);

-- Agendamentos
CREATE TABLE agendamentos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id),
  unidade       TEXT    NOT NULL,
  especialidade TEXT    NOT NULL,
  data          TEXT    NOT NULL,
  horario       TEXT    NOT NULL,
  paciente      TEXT    NOT NULL,
  cpf           TEXT,
  telefone      TEXT,
  observacoes   TEXT,
  status        TEXT    NOT NULL DEFAULT 'confirmado',
  criado_em     TEXT    DEFAULT (datetime('now'))
);

-- Avaliações
CREATE TABLE avaliacoes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  unidade_id TEXT    NOT NULL,
  nota       INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  criado_em  TEXT    DEFAULT (datetime('now'))
);
```

O banco e as tabelas são criados automaticamente ao iniciar o servidor.

---

## Segurança

- **Middleware de Autenticação:** Todas as rotas `/api/*` (exceto login/cadastro) requerem token válido
- **Tokens HMAC-SHA256:** Sessões assinadas com `AUTH_SECRET` do `.env`, expiração de 24h
- **userId do Token:** O identificador do usuário é extraído do token validado no servidor, não mais confiado do cliente
- **Cadastro Seguro:** Perfil de usuário é forçado como `cidadao` no servidor
- **.env Protegido:** Variáveis sensíveis nunca são commitadas (`.gitignore`)
- **Prepared Statements:** Queries parametrizadas para prevenir SQL Injection

---

## Histórico do Projeto

| Fase | Descrição | Tecnologia |
|------|-----------|-----------|
| **Fase 1** | Levantamento de requisitos | Documentação (req-system, req-user) |
| **Fase 2** | Protótipo funcional | HTML/CSS/JS estático + sql.js (WASM) |
| **Fase 3** | Backend + Frontend separados | React 18 + Node.js/Express + better-sqlite3 |
| **Fase 4** | Sistema integrado atual | Next.js 14 (App Router) + sql.js + HMAC auth |

---

## Contato e Repositório

- **Repositório:** [github.com/danieeee3344/localize-sua-saude](https://github.com/danieeee3344/localize-sua-saude)
- **Região atendida:** Barra do Garças (MT), Pontal do Araguaia (MT), Aragarças (GO)

---

## Licença

Desenvolvido para fins acadêmicos e educacionais.
