import { FormEvent, useState } from 'react';
import { api } from '../api';
import { Field, SelectField, TextArea } from '../components/Field';
import { Modal } from '../components/Modal';
import type { AdminUser, Appointment, Patient } from '../types';

type Props = {
    clinicId: number;
    patients: Patient[];
    adminUsers: AdminUser[];
    appointments: Appointment[];
    reload: () => Promise<void>;
};

export function AppointmentsPage({ clinicId, patients, adminUsers, appointments, reload }: Props) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await api.createAppointment({
            clinic_id: clinicId,
            patient_id: Number(form.get('patient_id')),
            user_id: Number(form.get('user_id')) || null,
            appointment_date: String(form.get('appointment_date')),
            start_time: String(form.get('start_time')),
            end_time: String(form.get('end_time') || '') || null,
            reason: String(form.get('reason') || ''),
            status: String(form.get('status')) as Appointment['status'],
            notes: String(form.get('notes') || ''),
        });
        setOpen(false);
        setMessage('Cita registrada correctamente.');
        await reload();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button onClick={() => setOpen(true)} className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">
                    Nueva cita
                </button>
            </div>
            {message ? <p className="rounded-2xl bg-primary-fixed px-5 py-3 text-sm font-bold text-on-primary-fixed">{message}</p> : null}
            <div className="grid gap-4">
                {appointments.map((appointment) => (
                    <article key={appointment.id} className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{appointment.appointment_date?.slice(0, 10)} · {appointment.start_time}</p>
                                <h3 className="mt-1 text-xl font-black">{appointment.patient?.first_name} {appointment.patient?.last_name}</h3>
                                <p className="text-sm text-on-surface-variant">{appointment.reason || 'Consulta médica'}</p>
                            </div>
                            <span className="w-fit rounded-full bg-secondary-container px-4 py-2 text-xs font-bold uppercase text-on-secondary-container">{appointment.status}</span>
                        </div>
                    </article>
                ))}
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Nueva Cita Médica" subtitle="Reserva conectada al modelo Appointment">
                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <SelectField name="patient_id" label="Paciente" required>
                            <option value="">Seleccionar</option>
                            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>)}
                        </SelectField>
                        <SelectField name="user_id" label="Administrador">
                            <option value="">Sin asignar</option>
                            {adminUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </SelectField>
                        <Field name="appointment_date" label="Fecha" type="date" required />
                        <Field name="start_time" label="Hora inicio" type="time" required />
                        <Field name="end_time" label="Hora fin" type="time" />
                        <SelectField name="status" label="Estado" defaultValue="scheduled">
                            <option value="scheduled">Programada</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="completed">Completada</option>
                            <option value="served">Atendida</option>
                            <option value="cancelled">Cancelada</option>
                            <option value="no_show">No asistió</option>
                        </SelectField>
                    </div>
                    <Field name="reason" label="Motivo" />
                    <TextArea name="notes" label="Notas" rows={4} />
                    <button className="rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary">
                        Confirmar Reserva
                    </button>
                </form>
            </Modal>
        </div>
    );
}
