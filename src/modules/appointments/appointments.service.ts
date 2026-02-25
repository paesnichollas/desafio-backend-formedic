import {
  AppointmentsRepository,
  Appointment
} from "./appointments.repository";
import { ValidationError } from "./appointments.errors";

const SLOT_MINUTES = new Set([0, 30]);

export interface CreateAppointmentCommand {
  professionalId: string;
  patientId: string;
  startAt: string;
}

export interface ListAppointmentsByDateAndProfessionalCommand {
  date: string;
  professionalId: string;
}

export class AppointmentsService {
  public constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly nowProvider: () => Date = () => new Date()
  ) {}

  public async createAppointment(input: CreateAppointmentCommand): Promise<Appointment> {
    const startAt = new Date(input.startAt);

    if (Number.isNaN(startAt.getTime())) {
      throw new ValidationError("startAt must be a valid datetime with timezone.");
    }

    if (startAt <= this.nowProvider()) {
      throw new ValidationError("startAt must be in the future.");
    }

    if (!SLOT_MINUTES.has(startAt.getUTCMinutes())) {
      throw new ValidationError("startAt minute must be 0 or 30.");
    }

    return this.appointmentsRepository.create({
      professionalId: input.professionalId,
      patientId: input.patientId,
      startAt
    });
  }

  public async listAppointmentsByDateAndProfessional(
    input: ListAppointmentsByDateAndProfessionalCommand
  ): Promise<Appointment[]> {
    const startOfDay = this.parseDateStartUtc(input.date);

    if (startOfDay === null) {
      throw new ValidationError("date must be a valid UTC date in format YYYY-MM-DD.");
    }

    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return this.appointmentsRepository.listByDayAndProfessional({
      professionalId: input.professionalId,
      startOfDay,
      endOfDay
    });
  }

  private parseDateStartUtc(date: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return null;
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    if (parsed.toISOString().slice(0, 10) !== date) {
      return null;
    }

    return parsed;
  }
}
