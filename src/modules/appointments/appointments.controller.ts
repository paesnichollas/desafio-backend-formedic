import { FastifyReply, FastifyRequest } from "fastify";

import {
  createAppointmentBodySchema,
  listAppointmentsQuerySchema
} from "./appointments.schemas";
import { AppointmentsService } from "./appointments.service";
import { Appointment } from "./appointments.repository";

interface AppointmentOutput {
  id: string;
  professionalId: string;
  patientId: string;
  startAt: string;
  createdAt: string;
}

function toOutput(appointment: Appointment): AppointmentOutput {
  return {
    id: appointment.id,
    professionalId: appointment.professionalId,
    patientId: appointment.patientId,
    startAt: appointment.startAt.toISOString(),
    createdAt: appointment.createdAt.toISOString()
  };
}

export class AppointmentsController {
  public constructor(private readonly appointmentsService: AppointmentsService) {}

  public create = async (
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const body = createAppointmentBodySchema.parse(request.body);
    const appointment = await this.appointmentsService.createAppointment(body);

    return reply.status(201).send(toOutput(appointment));
  };

  public listByDateAndProfessional = async (
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const query = listAppointmentsQuerySchema.parse(request.query);
    const appointments = await this.appointmentsService.listAppointmentsByDateAndProfessional(query);

    return reply.status(200).send({
      items: appointments.map(toOutput)
    });
  };
}
