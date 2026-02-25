import Fastify, { FastifyInstance } from "fastify";

import { env } from "./config/env";
import { createPostgresPool } from "./db";
import { registerErrorHandler } from "./http/error-handler";
import { registerRoutes } from "./http/routes";
import { AppointmentsController } from "./modules/appointments/appointments.controller";
import { PostgresAppointmentsRepository } from "./modules/appointments/appointments.repository.pg";
import { AppointmentsService } from "./modules/appointments/appointments.service";

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify();
  const pool = createPostgresPool();

  const appointmentsRepository = new PostgresAppointmentsRepository(pool);
  const appointmentsService = new AppointmentsService(appointmentsRepository);
  const appointmentsController = new AppointmentsController(appointmentsService);

  registerErrorHandler(app);
  await registerRoutes(app, { appointmentsController });

  app.addHook("onClose", async () => {
    await pool.end();
  });

  return app;
}

async function startServer(): Promise<void> {
  const app = await buildServer();
  await app.listen({ host: env.HOST, port: env.PORT });
}

if (require.main === module) {
  startServer().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
}
