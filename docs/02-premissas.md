# 02 - Premissas

Premissas adotadas para eliminar ambiguidades:

- Horários em UTC.
- `startAt` representa data e hora completas.
- Duração fixa de 30 minutos.
- Slot válido somente com minuto `00` ou `30`.
- Não permitir agendamento no passado.
- Conflito definido por mesmo `professionalId` e mesmo `startAt`.
- Integridade de conflito garantida por `UNIQUE (professional_id, start_at)` no banco.
