import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const createAppointmentBodySchema = z.object({
  professionalId: z.string().trim().min(1),
  patientId: z.string().trim().min(1),
  startAt: z.string().datetime({ offset: true })
});

export const listAppointmentsQuerySchema = z.object({
  date: z.string().regex(datePattern, "date must match YYYY-MM-DD"),
  professionalId: z.string().trim().min(1)
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentBodySchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
