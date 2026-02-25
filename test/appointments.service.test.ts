import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { AppointmentConflictError, ValidationError } from "../src/modules/appointments/appointments.errors";
import {
  Appointment,
  AppointmentsRepository,
  CreateAppointmentInput,
  ListAppointmentsByDayInput
} from "../src/modules/appointments/appointments.repository";
import { AppointmentsService } from "../src/modules/appointments/appointments.service";

class InMemoryAppointmentsRepository implements AppointmentsRepository {
  private readonly items: Appointment[] = [];

  public async create(input: CreateAppointmentInput): Promise<Appointment> {
    const hasConflict = this.items.some(
      (item) =>
        item.professionalId === input.professionalId &&
        item.startAt.getTime() === input.startAt.getTime()
    );

    if (hasConflict) {
      throw new AppointmentConflictError();
    }

    const appointment: Appointment = {
      id: randomUUID(),
      professionalId: input.professionalId,
      patientId: input.patientId,
      startAt: input.startAt,
      createdAt: new Date("2026-02-25T10:00:00.000Z")
    };

    this.items.push(appointment);

    return appointment;
  }

  public async listByDayAndProfessional(input: ListAppointmentsByDayInput): Promise<Appointment[]> {
    return this.items
      .filter(
        (item) =>
          item.professionalId === input.professionalId &&
          item.startAt >= input.startOfDay &&
          item.startAt < input.endOfDay
      )
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }
}

describe("AppointmentsService", () => {
  it("should create appointment", async () => {
    const repository = new InMemoryAppointmentsRepository();
    const service = new AppointmentsService(repository, () => new Date("2026-02-25T10:00:00.000Z"));

    const appointment = await service.createAppointment({
      professionalId: "professional-1",
      patientId: "patient-1",
      startAt: "2026-02-25T10:30:00.000Z"
    });

    expect(appointment.id).toBeTypeOf("string");
    expect(appointment.professionalId).toBe("professional-1");
    expect(appointment.patientId).toBe("patient-1");
    expect(appointment.startAt.toISOString()).toBe("2026-02-25T10:30:00.000Z");
  });

  it("should reject appointment in the past", async () => {
    const repository = new InMemoryAppointmentsRepository();
    const service = new AppointmentsService(repository, () => new Date("2026-02-25T10:00:00.000Z"));

    await expect(
      service.createAppointment({
        professionalId: "professional-1",
        patientId: "patient-1",
        startAt: "2026-02-25T09:30:00.000Z"
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("should reject invalid minute slot", async () => {
    const repository = new InMemoryAppointmentsRepository();
    const service = new AppointmentsService(repository, () => new Date("2026-02-25T10:00:00.000Z"));

    await expect(
      service.createAppointment({
        professionalId: "professional-1",
        patientId: "patient-1",
        startAt: "2026-02-25T10:15:00.000Z"
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("should reject conflict for same professional and startAt", async () => {
    const repository = new InMemoryAppointmentsRepository();
    const service = new AppointmentsService(repository, () => new Date("2026-02-25T10:00:00.000Z"));

    await service.createAppointment({
      professionalId: "professional-1",
      patientId: "patient-1",
      startAt: "2026-02-25T10:30:00.000Z"
    });

    await expect(
      service.createAppointment({
        professionalId: "professional-1",
        patientId: "patient-2",
        startAt: "2026-02-25T10:30:00.000Z"
      })
    ).rejects.toBeInstanceOf(AppointmentConflictError);
  });
});
