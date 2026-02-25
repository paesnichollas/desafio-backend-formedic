import { FastifyInstance } from "fastify";

import { AppointmentsController } from "../modules/appointments/appointments.controller";
import { registerAppointmentsRoutes } from "../modules/appointments/appointments.routes";

export interface HttpRoutesDependencies {
  appointmentsController: AppointmentsController;
}

export async function registerRoutes(
  app: FastifyInstance,
  dependencies: HttpRoutesDependencies
): Promise<void> {
  app.get("/health", async () => ({ status: "ok" }));
  await registerAppointmentsRoutes(app, dependencies.appointmentsController);
}
