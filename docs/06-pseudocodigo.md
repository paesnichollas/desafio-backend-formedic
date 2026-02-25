# 06 - Pseudocódigo

## createAppointment(input)

```text
validar campos obrigatórios
parse startAt
se startAt inválido -> 400
se startAt <= nowUTC -> 400
se minuto(startAt) não for 0 ou 30 -> 400

try:
  inserir em appointments
catch unique_violation(professional_id, start_at):
  retornar 409

retornar 201 com agendamento criado
```

## listAppointmentsByDateAndProfessional(input)

```text
validar date (YYYY-MM-DD) e professionalId
converter date para startOfDay UTC
calcular endOfDay UTC

buscar appointments por:
  professional_id = professionalId
  start_at >= startOfDay
  start_at < endOfDay
ordenar start_at asc

retornar 200 com items
```
