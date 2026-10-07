# Localize Sua Saúde (Vale do Araguaia)

Plataforma Web Full-Stack para localização de unidades de saúde, consulta de estoque de medicamentos, agendamento de consultas e avaliações comunitárias na região conurbada de **Barra do Garças (MT)**, **Pontal do Araguaia (MT)** e **Aragarças (GO)**.

Desenvolvido para a matéria de **Projeto e Desenvolvimento de Sistemas** — 3º Ano A (Informática)  
**Professor:** Carlos David  
**Equipe:** Hemily Gouveia, Daniel Reges, Beatriz Telles e Marcela Oliveira  
**Versão:** 3.0.0  

---

## 🏗️ Arquitetura e Estrutura do Projeto

O projeto segue estritamente a separação modular de responsabilidades:

```
localize-sua-saude/
├── Doc/                                 # Documentação do Projeto
│   ├── escopo_do_projeto.md             # Escopo SMART, EAP e Governança
│   ├── requisitos_de_sistema.md         # Requisitos de Sistema (RSF/RSNF)
│   ├── requisitos_de_usuario.md         # Requisitos de Usuário (Histórias/Critérios)
│   ├── requisitos-software.md           # Especificação de Requisitos (RF01-RF07)
│   ├── auditoria_autenticacao.md        # Relatório de Auditoria de Segurança
│   ├── checklist_commit_seguro.md       # Diretrizes de Commits Seguros
│   ├── plano_correcao.md                # Plano de Resolução e Melhorias
│   └── *.puml                           # Diagramas UML (Casos de Uso, Sequência, etc.)
│
├── API/                                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/                      # Conexão com SQLite
│   │   ├── controladores/               # Auth, Unidades, Medicamentos, Agendamentos, Avaliações, Leads
│   │   ├── rotas/                       # Endpoints RESTful (/api/*)
│   │   ├── utilitarios/                 # Criptografia, Tokens JWT/HMAC, Validações, Rate Limit
│   │   ├── app.js                       # Configuração do Express, CORS e Middlewares
│   │   └── server.js                    # Inicialização do servidor
│   ├── db/                              # 💾 DB (Banco de Dados SQLite — acessado apenas pelo backend)
│   │   └── saude.db                     # Arquivo de persistência (ignorado no Git)
│   ├── iniciarBanco.js                  # Script de criação de schema, tabelas e seeds
│   ├── package.json                     # Dependências do Backend
│   └── .env.example                     # Modelo de variáveis de ambiente do backend
│
├── Frontend/                            # Frontend (HTML5, CSS, React + Vite)
│   ├── src/
│   │   ├── components/                  # Componentes (Acessibilidade, Header, Unidades, Medicamentos, Agendamento, Login, Admin)
│   │   ├── servicos/                    # apiCliente.js (Comunicação exclusiva com a API Backend)
│   │   ├── App.jsx                      # Aplicação Principal e Roteamento SPA
│   │   ├── index.css                    # Design System, WCAG 2.1 AA, Modo Idoso e Alto Contraste
│   │   └── main.jsx                     # Ponto de entrada do React
│   ├── public/                          # Imagens e logomarcas dos estabelecimentos
│   ├── package.json                     # Dependências do Frontend
│   └── .env.example                     # Variáveis do Frontend
│
├── .gitignore                           # Proteção de segurança (ignora .env, *.log, *.db)
├── .env.example                         # Exemplo das chaves e portas raiz
├── package.json                         # Scripts unificados de execução
└── README.md                            # Guia principal do projeto
```

---

## 🚀 Requisitos de Software Aplicados

| Requisito | Nome | Descrição | Status |
|-----------|------|-----------|--------|
| **RF01** | **Busca e Filtragem** | Pesquisa por termo, cidade (Barra do Garças, Pontal do Araguaia, Aragarças), tipo (Hospital, UBS, Clínica, Laboratório), atendimento (SUS, Particular, Convênio) e especialidades. | ✅ Aplicado |
| **RF02** | **Geolocalização & Mapa** | Captura de coordenadas GPS via HTML5, busca de endereço por CEP (ViaCEP API) e visualização em mapa interativo integrado. | ✅ Aplicado |
| **RF03** | **Perfil Detalhado da Unidade** | Endereço completo, horários, convênios aceitos, especialidades, fotos reais e notas médias. | ✅ Aplicado |
| **RF04** | **Avaliações Comunitárias** | Usuários cadastrados avaliam de 1 a 5 estrelas e publicam comentários sobre o atendimento. Média calculada dinamicamente. | ✅ Aplicado |
| **RF05** | **Atalhos de Contato Direto** | Botões de ação rápida "📞 Ligar Agora" e "💬 WhatsApp" diretamente nos cards das unidades. | ✅ Aplicado |
| **RF06** | **Alta Acessibilidade (Idosos)** | Barra de acessibilidade com Modo Idoso (fontes e botões ampliados), Alto Contraste e ajuste A+/A- em conformidade com WCAG 2.1 AA. | ✅ Aplicado |
| **RF07** | **Moderação de Avaliações** | Painel administrativo (`/admin`) para gestores moderarem comentários e aprovarem novos estabelecimentos parceiros (RN01). | ✅ Aplicado |
| **RSF-MED** | **Consulta de Medicamentos** | Pesquisa de disponibilidade de remédios em tempo real com status de estoque (Disponível, Baixo estoque, Sem estoque) por unidade. | ✅ Aplicado |
| **RSF-AGD** | **Agendamento Digital** | Formulário de agendamento de consultas com seleção de horários disponíveis e aba de cancelamento em "Meus Agendamentos". | ✅ Aplicado |
| **RSF-AUTH**| **Autenticação Segura** | Cadastro e Login com hash de senha SHA-256 e emissão de tokens de sessão para os perfis Cidadão, Atendente e Gestor. | ✅ Aplicado |

---

## 🔒 Segurança e Configuração (`.env` & `.gitignore`)

O projeto implementa proteção fail-safe:
1. **`.gitignore`**: Impede o envio de:
   - Arquivos de segredos (`.env`, `.env.local`)
   - Arquivos de log (`*.log`, `logs/`, `server.log`)
   - Arquivos binários do banco de dados SQLite (`*.db`, `*.sqlite`, `*.db-wal`, `api/db/*.db`)
   - Pacotes (`node_modules/`) e builds (`dist/`, `.next/`)
2. **`.env` (Configurações do Servidor)**:
   - `PORT`: Porta do servidor backend (Padrão: `3000`)
   - `JWT_SECRET`: Chave secreta de assinatura de tokens de autenticação
   - `API_KEY_ADMIN` & `API_KEY_PUBLICA`: Chaves de proteção contra requisições não autorizadas
   - `ORIGEM_PERMITIDA`: Domínios permitidos via CORS (ex: `http://localhost:5173`)
   - `VITE_API_URL`: Endereço base da API consumido pelo Frontend (`http://localhost:3000/api`)

---

## 📦 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)

### 1. Instalação das dependências
Na raiz do projeto:
```bash
npm run setup
```
*(Ou instale manualmente entrando em `api` e `frontend`: `cd api && npm install && cd ../frontend && npm install`)*

### 2. Inicialização do Banco de Dados SQLite
O banco de dados com os dados iniciais do Vale do Araguaia é criado automaticamente ao iniciar o servidor, ou manualmente via:
```bash
cd api
node iniciarBanco.js
```

### 3. Execução em Desenvolvimento

Para rodar o **Backend (API)**:
```bash
cd api
npm run dev
```
*(API rodando em `http://localhost:3000`)*

Para rodar o **Frontend (Vite)**:
```bash
cd frontend
npm run dev
```
*(Frontend rodando em `http://localhost:5173`)*

---

## 👥 Contas de Demonstração Rápidas

Para facilitar testes e apresentação dos requisitos:
- **Cidadão / Paciente:** `cidadao@teste.com` / Senha: `123456`
- **Atendente:** `atendente@teste.com` / Senha: `123456`
- **Gestor / Moderador:** `gestor@teste.com` / Senha: `123456`
