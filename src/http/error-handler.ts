import { FastifyInstance } from "fastify";
import { ZodError } from "zod";

import { AppError } from "../modules/appointments/appointments.errors";

function formatErrorResponse(error: AppError): { error: { code: string; message: string; details?: unknown } } {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {})
    }
  };
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      void reply.status(error.statusCode).send(formatErrorResponse(error));
      return;
    }

    if (error instanceof ZodError) {
      void reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
          details: error.flatten()
        }
      });
      return;
    }

    void reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected internal error."
      }
    });
  });
}
