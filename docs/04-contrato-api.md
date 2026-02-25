# 04 - Contrato de API

## GET /health

Resposta `200`:

```json
{ "status": "ok" }
```

## POST /appointments

Body:

```json
{
  "professionalId": "prof-1",
  "patientId": "patient-1",
  "startAt": "2026-03-01T14:00:00.000Z"
}
```

Respostas:

- `201` criado
- `400` validação/regra de negócio
- `409` conflito (`professionalId + startAt`)

## GET /appointments?date=YYYY-MM-DD&professionalId=...

Query obrigatória:

- `date`
- `professionalId`

Resposta `200`:

```json
{
  "items": [
    {
      "id": "uuid",
      "professionalId": "prof-1",
      "patientId": "patient-1",
      "startAt": "2026-03-01T14:00:00.000Z",
      "createdAt": "2026-02-25T12:00:00.000Z"
    }
  ]
}
```

Erro padrão:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": {}
  }
}
```
