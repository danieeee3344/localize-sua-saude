Requisitos de Usuário

Sobre

Este documento mostra os principais requisitos de usuário do sistema Localize Sua Saúde. Aqui estão os tipos de usuários, algumas histórias de uso e o que o sistema precisa fazer para atender cada um deles.

Perfis de Usuário

| Perfil | Descrição |
|---------|-----------|
| Cidadão / Paciente | Pessoa que utiliza o sistema para procurar unidades de saúde, medicamentos e fazer agendamentos. |
| Atendente | Funcionário da unidade de saúde que atualiza os estoques e ajuda no gerenciamento dos atendimentos. |
| Gestor | Responsável por administrar o sistema e controlar as unidades cadastradas. |

Personas

Maria Silva

- 62 anos
- Aposentada
- Precisa encontrar seus remédios antes de ir até a UBS.

João Mendes

- 28 anos
- Trabalhador autônomo
- Quer achar uma unidade próxima e agendar um atendimento sem perder tempo.

Histórias de Usuário

US01 - Encontrar unidades

Como cidadão,

Quero encontrar unidades de saúde próximas usando minha localização ou CEP,

Para saber qual é a unidade mais perto de mim.

Critérios

- O sistema deve permitir usar a localização.
- Caso a localização não seja permitida, o usuário pode informar o CEP.
- Mostrar a distância até cada unidade.
- Exibir os resultados em lista e no mapa.

US02 - Filtrar serviços

Como cidadão,

Quero filtrar as unidades pelos serviços oferecidos,

Para encontrar apenas as unidades que atendem minha necessidade.

Critérios

- Permitir escolher mais de um serviço.
- Mostrar apenas unidades que oferecem os serviços escolhidos.

US03 - Consultar medicamentos

Como paciente,

Quero pesquisar um medicamento,

Para saber onde ele está disponível.

Critérios

- Pesquisar pelo nome do medicamento.
- Informar se está disponível.
- Mostrar quando o estoque foi atualizado.

US04 - Atualizar estoque

Como atendente,

Quero atualizar o estoque dos medicamentos da minha unidade,

Para manter as informações corretas.

Critérios

- Alterar apenas o estoque da própria unidade.
- Registrar quem fez a alteração.
- Salvar data e horário.

US05 - Agendar consulta

Como cidadão,

Quero marcar uma consulta,

Para evitar filas na unidade.

Critérios

- Mostrar apenas horários disponíveis.
- Confirmar o agendamento.
- Permitir cancelar até 24 horas antes.

Regras

- Apenas usuários cadastrados podem agendar consultas.
- O atendente só pode alterar informações da unidade em que trabalha.
- O gestor tem acesso a todas as funções do sistema.
- O estoque sempre deve mostrar a última atualização feita.

Jornada do Usuário

```text
Acessa o sistema
      │
      ▼
Informa a localização ou CEP
      │
      ▼
Pesquisa um medicamento ou serviço
      │
      ▼
Visualiza as unidades encontradas
      │
      ▼
Escolhe uma unidade
      │
      ▼
Consulta endereço e horário
      │
      ▼
Faz o agendamento (se desejar)
```

Resumo

| Código | Descrição |
|---------|-----------|
| US01 | Localizar unidades de saúde |
| US02 | Filtrar unidades por serviços |
| US03 | Consultar medicamentos |
| US04 | Atualizar estoque |
| US05 | Agendar consultas |

Objetivo

O objetivo do Localize Sua Saúde é facilitar o acesso da população às informações das unidades de saúde, permitindo encontrar medicamentos, localizar serviços e realizar agendamentos de forma rápida e simples.
