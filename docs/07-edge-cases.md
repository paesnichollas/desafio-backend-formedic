# 07 - Casos de borda

- Duas requisições simultâneas para mesmo profissional/horário.
- `date` inválida (`2026-02-30`) na listagem.
- `startAt` no passado.
- `startAt` com minuto diferente de `00` ou `30`.
- Datas em fusos diferentes normalizadas para UTC.
