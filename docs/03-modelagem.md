# 03 - Modelagem

Tabela principal: `appointments`

Campos:

- `id` (uuid, PK)
- `professional_id` (text, obrigatório)
- `patient_id` (text, obrigatório)
- `start_at` (timestamptz, obrigatório)
- `created_at` (timestamptz, obrigatório)

Integridade:

- `UNIQUE (professional_id, start_at)` para impedir conflito em concorrência.
- Índice em `start_at` para leitura por faixa de dia.

Observação: não há tabelas de `professionals` e `patients` neste escopo mínimo.
