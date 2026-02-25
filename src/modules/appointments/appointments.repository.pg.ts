import { Pool } from "pg";

import { AppointmentConflictError } from "./appointments.errors";
import {
  Appointment,
  AppointmentsRepository,
  CreateAppointmentInput,
  ListAppointmentsByDayInput
} from "./appointments.repository";

interface AppointmentRow {
  id: string;
  professional_id: string;
  patient_id: string;
  start_at: Date;
  created_at: Date;
}

function mapRowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    professionalId: row.professional_id,
    patientId: row.patient_id,
    startAt: new Date(row.start_at),
    createdAt: new Date(row.created_at)
  };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export class PostgresAppointmentsRepository implements AppointmentsRepository {
  public constructor(private readonly pool: Pool) {}

  public async create(input: CreateAppointmentInput): Promise<Appointment> {
    try {
      const result = await this.pool.query<AppointmentRow>(
        `
          INSERT INTO appointments (professional_id, patient_id, start_at)
          VALUES ($1, $2, $3)
          RETURNING id, professional_id, patient_id, start_at, created_at
        `,
        [input.professionalId, input.patientId, input.startAt.toISOString()]
      );

      return mapRowToAppointment(result.rows[0]);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppointmentConflictError();
      }

      throw error;
    }
  }

  public async listByDayAndProfessional(input: ListAppointmentsByDayInput): Promise<Appointment[]> {
    const result = await this.pool.query<AppointmentRow>(
      `
        SELECT id, professional_id, patient_id, start_at, created_at
        FROM appointments
        WHERE professional_id = $1
          AND start_at >= $2
          AND start_at < $3
        ORDER BY start_at ASC
      `,
      [input.professionalId, input.startOfDay.toISOString(), input.endOfDay.toISOString()]
    );

    return result.rows.map(mapRowToAppointment);
  }
}
