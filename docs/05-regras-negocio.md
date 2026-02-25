# 05 - Regras de negócio

Na criação (`POST /appointments`):

1. `professionalId`, `patientId` e `startAt` obrigatórios.
2. `startAt` deve ser datetime válido com timezone.
3. `startAt` deve estar no futuro.
4. Minuto de `startAt` deve ser `0` ou `30`.
5. Conflito deve retornar `409`.

Na listagem (`GET /appointments`):

1. `date` deve seguir `YYYY-MM-DD` e ser data real.
2. `professionalId` obrigatório.
3. Filtro por janela UTC do dia `[00:00, próximo 00:00)`.
4. Ordenação por `startAt` ascendente.
