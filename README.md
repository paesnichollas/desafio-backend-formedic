# Desafio Backend — Formedic API

## 🎯 Objetivo

Implementar uma API enxuta de agendamento médico que atenda exclusivamente ao escopo solicitado:

- Criar agendamento
- Listar agendamentos por dia
- Listar agendamentos por profissional
- Impedir conflito de horário

A proposta prioriza simplicidade estrutural, integridade de dados e clareza de responsabilidades, evitando qualquer complexidade que não esteja explicitamente prevista no enunciado.

## 📌 Escopo e Delimitações

### Implementado

- Persistência em PostgreSQL
- Validação estruturada de entrada
- Controle de conflito no nível do banco
- Separação clara entre controller e service
- Testes unitários focados nas regras críticas

### Fora de escopo (deliberadamente)

- Autenticação e autorização
- Cancelamento ou edição de agendamentos
- Microserviços
- Observabilidade avançada
- Tabelas auxiliares para pacientes/profissionais

Essas decisões foram intencionais para manter o foco no problema principal.

## 🧱 Stack Técnica

| Tecnologia          | Papel                    |
| ------------------- | ------------------------ |
| Node.js 20+         | Runtime                  |
| TypeScript (strict) | Segurança de tipos       |
| Fastify             | Camada HTTP performática |
| PostgreSQL          | Persistência relacional  |
| Zod                 | Validação de schemas     |
| Vitest              | Testes unitários         |
| Docker Compose      | Ambiente local isolado   |

Critério de escolha: stack madura, simples e suficiente para resolver o problema sem overengineering.

## 🗄 Modelagem de Dados

Optou-se por modelagem mínima, alinhada ao escopo:

```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id text NOT NULL,
  patient_id text NOT NULL,
  start_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_professional_start_at_unique
  UNIQUE (professional_id, start_at)
);
```

### Decisões importantes

- `timestamptz` armazenado em UTC
- Não foram criadas tabelas de pacientes/profissionais
- Conflito resolvido via `UNIQUE (professional_id, start_at)`
- Índice adicional em `start_at` para listagem eficiente

Essa abordagem delega concorrência ao banco, eliminando race conditions na aplicação.

## ⚙️ Regras de Negócio

As regras são concentradas no service:

- `startAt` deve estar no futuro
- Minutos permitidos: apenas `00` ou `30`
- Timezone padrão UTC
- Conflito garantido via constraint no banco
- Listagem por intervalo de dia (UTC)
- Ordenação crescente por horário

Validações de formato e estrutura são feitas previamente com Zod.

## 🔄 Fluxo Interno

```text
HTTP (Fastify)
   ↓
Controller
   ↓
Service (regras de negócio)
   ↓
Database (PostgreSQL)
```

- Controller: orquestra entrada e saída
- Service: concentra lógica
- Banco: garante integridade estrutural

A arquitetura é propositalmente simples para respeitar o escopo.

## 🚀 Endpoints

| Método | Rota                                               | Descrição         |
| ------ | -------------------------------------------------- | ----------------- |
| GET    | `/health`                                          | Health check      |
| POST   | `/appointments`                                    | Criar agendamento |
| GET    | `/appointments?date=YYYY-MM-DD&professionalId=...` | Listar por dia    |

## 🧪 Testes

Testes unitários no service validam:

- Criação com sucesso
- Bloqueio de data no passado
- Bloqueio de minuto inválido
- Bloqueio de conflito

O foco foi validar as regras críticas de negócio, não infraestrutura.

## ⚖️ Decisões e Trade-offs

### Por que não criar tabela de pacientes/profissionais?

O desafio não exige CRUD desses recursos. Criá-los adicionaria complexidade desnecessária.

### Por que não verificar conflito antes de inserir?

Porque validação prévia não elimina race condition sob concorrência.
A constraint no banco é a fonte de verdade.

### Por que não usar Clean Architecture completa?

O escopo não demanda múltiplos bancos, múltiplas integrações ou substituições de infraestrutura.
Introduzir camadas adicionais aumentaria complexidade sem ganho proporcional.

## 🐳 Execução

### Local

```bash
npm install
npm run db:migrate
npm run dev
```

### Com Docker

```bash
docker compose up -d
npm run db:migrate
npm run dev
```

## Uso de IA no Workflow

Durante o desenvolvimento, utilizei a IA Codex como ferramenta de apoio para acelerar tarefas operacionais, principalmente na geração de estruturas repetitivas.

O uso foi focado em:

- Auxiliar na criação de schemas e tipagens no TypeScript
- Sugerir ajustes de nomenclatura para manter coerência entre controller, service e banco
- Revisar rapidamente trechos de validação, como regra de slot (`00` e `30`) e tratamento de conflito

As decisões arquiteturais, definição de regras de negócio e escolha dos trade-offs foram conduzidas manualmente, com a IA atuando apenas como apoio produtivo, não como fonte de decisão técnica.

## 🧠 Considerações Finais

Esta implementação foi construída com foco em:

- Respeitar rigorosamente o escopo
- Garantir integridade sob concorrência
- Demonstrar clareza na separação de responsabilidades
- Evitar complexidade não solicitada
- Priorizar robustez com simplicidade

A solução busca equilíbrio entre pragmatismo e qualidade técnica.
