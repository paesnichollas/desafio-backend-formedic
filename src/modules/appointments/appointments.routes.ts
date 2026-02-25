import { FastifyInstance } from "fastify";

import { AppointmentsController } from "./appointments.controller";

export async function registerAppointmentsRoutes(
  app: FastifyInstance,
  appointmentsController: AppointmentsController
): Promise<void> {
  app.post("/appointments", appointmentsController.create);
  app.get("/appointments", appointmentsController.listByDateAndProfessional);
}
