export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  public constructor(params: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = new.target.name;
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.details = params.details;
  }
}

export class ValidationError extends AppError {
  public constructor(message: string, details?: unknown) {
    super({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message,
      details
    });
  }
}

export class AppointmentConflictError extends AppError {
  public constructor() {
    super({
      code: "APPOINTMENT_CONFLICT",
      statusCode: 409,
      message: "Appointment already exists for this professional and startAt."
    });
  }
}
