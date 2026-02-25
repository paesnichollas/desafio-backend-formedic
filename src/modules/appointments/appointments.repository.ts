export interface Appointment {
  id: string;
  professionalId: string;
  patientId: string;
  startAt: Date;
  createdAt: Date;
}

export interface CreateAppointmentInput {
  professionalId: string;
  patientId: string;
  startAt: Date;
}

export interface ListAppointmentsByDayInput {
  professionalId: string;
  startOfDay: Date;
  endOfDay: Date;
}

export interface AppointmentsRepository {
  create(input: CreateAppointmentInput): Promise<Appointment>;
  listByDayAndProfessional(input: ListAppointmentsByDayInput): Promise<Appointment[]>;
}
