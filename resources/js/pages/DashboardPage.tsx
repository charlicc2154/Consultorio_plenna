import type { Appointment, ClinicalHistory, Patient } from '../types';

type Props = {
    patients: Patient[];
    appointments: Appointment[];
    clinicalHistories: ClinicalHistory[];
    onCreateAppointment: () => void;
    onCreatePatient: () => void;
};

export function DashboardPage({ patients, appointments, clinicalHistories, onCreateAppointment, onCreatePatient }: Props) {
    const today = new Date().toISOString().slice(0, 10);
    const todayAppointments = appointments.filter((appointment) => appointment.appointment_date?.slice(0, 10) === today);
    const completed = todayAppointments.filter((appointment) => appointment.status === 'completed').length;
    const progress = todayAppointments.length ? Math.round((completed / todayAppointments.length) * 100) : 0;

    return (
        <div className="space-y-8">
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col justify-between rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm lg:col-span-2">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant">Progreso del Día</h3>
                            <p className="text-4xl font-black tracking-tighter text-primary">
                                {completed} de {todayAppointments.length} <span className="text-2xl font-medium text-on-surface-variant/40">atendidas</span>
                            </p>
                        </div>
                        <span className="text-4xl font-black text-primary">{progress}%</span>
                    </div>
                    <div className="relative h-4 overflow-hidden rounded-full bg-surface-container-highest">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-8 flex gap-4">
                        <button onClick={onCreateAppointment} className="flex-1 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary">
                            Nueva Cita
                        </button>
                        <button onClick={onCreatePatient} className="flex-1 rounded-2xl bg-surface-container-high px-6 py-4 font-bold text-primary">
                            Registrar Paciente
                        </button>
                    </div>
                </div>
                <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-low p-8">
                    <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant">Resumen Activo</h3>
                    <div className="space-y-4">
                        <Summary icon="group" label="Pacientes" value={patients.length} />
                        <Summary icon="event" label="Citas" value={appointments.length} />
                        <Summary icon="history_edu" label="Historias" value={clinicalHistories.length} />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {todayAppointments.slice(0, 6).map((appointment) => (
                    <article key={appointment.id} className="rounded-3xl border border-outline-variant/10 bg-primary-fixed p-6 text-on-primary-fixed">
                        <p className="text-[10px] font-black uppercase tracking-widest">{appointment.start_time} {appointment.end_time ? `- ${appointment.end_time}` : ''}</p>
                        <h4 className="mt-2 text-lg font-black">{appointment.patient?.first_name} {appointment.patient?.last_name}</h4>
                        <p className="mt-1 text-sm opacity-75">{appointment.reason || 'Consulta médica'}</p>
                    </article>
                ))}
                {!todayAppointments.length ? (
                    <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-10 text-center text-sm font-bold uppercase tracking-widest text-on-surface-variant md:col-span-3">
                        Sin citas registradas para hoy
                    </div>
                ) : null}
            </section>
        </div>
    );
}

function Summary({ icon, label, value }: { icon: string; label: string; value: number }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-4">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
            </div>
        </div>
    );
}
