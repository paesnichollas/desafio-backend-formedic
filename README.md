# Desafio Backend Formedic

## 1. Contexto do desafio

Este repositório implementa um backend enxuto para agenda médica com foco no escopo mínimo:

- Criar agendamento
- Listar agendamentos por dia e profissional
- Impedir conflito de horário

Fora de escopo:

- Autenticação e autorização
- Cancelamento/edição
- Microserviços, mensageria e observabilidade avançada

## 2. Stack escolhida

- Node.js + TypeScript (strict)
- Fastify para HTTP
- PostgreSQL para persistência
- Zod para validação
- Vitest para testes unitários

Justificativa curta: stack simples, madura e suficiente para entregar regra de negócio com estrutura clara sem overengineering.

## 3. Como rodar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16+

### Passos

1. Instalar dependências:

```bash
npm install
```

2. Criar arquivo `.env` a partir de `.env.example`.

3. Aplicar migrações:

```bash
npm run db:migrate
```

4. Subir API:

```bash
npm run dev
```

5. Health check:

```bash
curl -i http://localhost:3333/health
```

## 4. Como rodar via Docker (Postgres)

1. Subir banco:

```bash
docker compose up -d
```

2. Executar migrações:

```bash
npm run db:migrate
```

3. Subir API:

```bash
npm run dev
```

## 5. Endpoints

| Método | Rota                                               | Descrição                       |
| ------ | -------------------------------------------------- | ------------------------------- |
| GET    | `/health`                                          | Verifica disponibilidade da API |
| POST   | `/appointments`                                    | Cria agendamento                |
| GET    | `/appointments?date=YYYY-MM-DD&professionalId=...` | Lista por dia e profissional    |

### Respostas de erro padrão

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": {}
  }
}
```

## 6. Exemplos curl

### Criar agendamento

```bash
curl -X POST http://localhost:3333/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "prof-1",
    "patientId": "patient-1",
    "startAt": "2026-03-01T14:00:00.000Z"
  }'
```

### Listar agendamentos por dia e profissional

```bash
curl "http://localhost:3333/appointments?date=2026-03-01&professionalId=prof-1"
```

## 7. Modelagem SQL

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id text NOT NULL,
  patient_id text NOT NULL,
  start_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_professional_start_at_unique UNIQUE (professional_id, start_at)
);

CREATE INDEX appointments_start_at_idx ON appointments (start_at);
```

## 8. Regras de negócio

1. `startAt` deve estar no futuro.
2. `startAt` só aceita minutos `00` ou `30`.
3. Timezone padrão em UTC.
4. Conflito garantido no banco por `UNIQUE (professional_id, start_at)`.
5. Listagem filtra por `date` e `professionalId` e ordena por `startAt` asc.

## 9. Decisões técnicas e trade-offs

- `patient_id` foi escolhido ao invés de `patient_name` para manter identificador estável.
- Não foram criadas tabelas de pacientes/profissionais neste escopo mínimo.
- A regra de conflito não depende de lock em aplicação; o banco resolve concorrência com constraint.
- Service concentra regras; controller apenas orquestra entrada/saída.

## 10. Como rodar testes

```bash
npm run test
```

Cobertura mínima de regra de negócio no service:

- should create appointment
- should reject appointment in the past
- should reject invalid minute slot
- should reject conflict for same professional and startAt
