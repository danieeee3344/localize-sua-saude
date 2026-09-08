# Documentação UML 2.5.1 - Localize Sua Saúde

Esta pasta contém a documentação de requisitos de usuário do projeto, seguindo a convenção UML versão 2.5.1.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `requisitos_usuario.md` | Documento principal com todos os requisitos de usuário |
| `diagrama_casos_uso.puml` | Diagrama de Casos de Uso principal |
| `diagrama_atividade_agendamento.puml` | Diagrama de Atividade para o fluxo de agendamento |
| `diagrama_estado_agendamento.puml` | Diagrama de Estado do ciclo de vida do agendamento |
| `diagrama_sequencia_login.puml` | Diagrama de Sequência para o fluxo de login |
| `diagrama_sequencia_agendamento.puml` | Diagrama de Sequência para o fluxo de agendamento |
| `diagrama_componentes.puml` | Diagrama de Componentes da arquitetura |

## Como Visualizar os Diagramas

### Opção 1: Online (Recomendado)
Acesse [PlantUML Online Server](http://www.plantuml.com/plantuml/) e cole o conteúdo de qualquer arquivo `.puml`.

### Opção 2: VS Code
Instale a extensão **PlantUML** para VS Code:
1. Abra um arquivo `.puml`
2. Use `Alt + D` para visualizar

### Opção 3: IntelliJ IDEA
Instale o plugin **PlantUML Integration**.

### Opção 4:linha de comando
```bash
# Instalar PlantUML
sudo apt-get install plantuml

# Gerar imagem PNG
plantuml diagrama_casos_uso.puml

# Gerar imagem SVG
plantuml -tsvg diagrama_casos_uso.puml
```

## Estrutura da Documentação

### 1. Requisitos de Usuário (`requisitos_usuario.md`)
- Diagrama de Casos de Uso (texto)
- Especificação detalhada de cada caso de uso
- Matriz de rastreabilidade
- Diagramas de atividade e estado
- Diagramas de sequência
- Lista de requisitos funcionais e não-funcionais
- Condições de aceite

### 2. Diagramas PlantUML (`.puml`)
- Diagrama de Casos de Uso
- Diagrama de Atividade
- Diagrama de Estado
- Diagramas de Sequência
- Diagrama de Componentes

## Convenção UML 2.5.1

Esta documentação segue os padrões da UML versão 2.5.1:

- **Atores**: Cidadão, Atendente, Gestor
- **Casos de Uso**: UC01 a UC14
- **Relacionamentos**: Participação, Inclusão (`<<include>>`), Extensão (`<<extend>>`)
- **Estados**: Criando, Confirmado, Em Andamento, Concluído, Cancelado, Reagendado
- **Atividades**: Fluxos principais e alternativos
- **Sequência**: Mensagens síncronas e assíncronas

## Requisitos Mapeados

| ID | Tipo | Descrição | Caso de Uso |
|----|------|-----------|-------------|
| RF01 | Funcional | Busca de unidades | UC01 |
| RF02 | Funcional | Geolocalização e CEP | UC04, UC05 |
| RF03 | Funcional | Detalhes das unidades | UC02 |
| RF04 | Funcional | Avaliação de unidades | UC09 |
| RF05 | Funcional | Ações de contato | UC02 |
| RF06 | Funcional | Consulta de medicamentos | UC03 |
| RF07 | Funcional | Autenticação e cadastro | UC06, UC07 |
| RF08 | Funcional | Agendamento de consultas | UC08, UC10, UC11 |
| RNF01 | Não-Funcional | Acessibilidade WCAG 2.1 | UC12 |
| RNF02 | Não-Funcional | Responsividade | UC04, UC12 |
| RNF03 | Não-Funcional | Persistência SQLite | Todos |
| RNF04 | Não-Funcional | Segurança de senhas | UC06, UC07 |

---

**Versão:** 1.0  
**Data:** Setembro 2026  
**Padrão:** UML 2.5.1
