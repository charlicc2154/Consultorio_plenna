import { FormEvent, useState } from 'react';
import { api } from '../api';
import { Field, SelectField, TextArea } from '../components/Field';
import { Modal } from '../components/Modal';
import type { AdminUser, Appointment, ClinicalHistory, Patient } from '../types';

type Props = {
    clinicId: number;
    patients: Patient[];
    adminUsers: AdminUser[];
    appointments: Appointment[];
    clinicalHistories: ClinicalHistory[];
    reload: () => Promise<void>;
};

export function ClinicalHistoriesPage({ clinicId, patients, adminUsers, appointments, clinicalHistories, reload }: Props) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await api.createClinicalHistory({
            clinic_id: clinicId,
            patient_id: Number(form.get('patient_id')),
            user_id: Number(form.get('user_id')) || null,
            appointment_id: Number(form.get('appointment_id')) || null,
            consultation_date: String(form.get('consultation_date')),
            reason_for_visit: String(form.get('reason_for_visit') || ''),
            symptoms: String(form.get('symptoms') || ''),
            diagnosis: String(form.get('diagnosis') || ''),
            treatment: String(form.get('treatment') || ''),
            prescription: String(form.get('prescription') || ''),
            observations: String(form.get('observations') || ''),
            weight: String(form.get('weight') || '') || null,
            height: String(form.get('height') || '') || null,
            blood_pressure: String(form.get('blood_pressure') || ''),
            temperature: String(form.get('temperature') || '') || null,
            heart_rate: Number(form.get('heart_rate')) || null,
            respiratory_rate: Number(form.get('respiratory_rate')) || null,
        });
        setOpen(false);
        setMessage('Historia clínica registrada correctamente.');
        await reload();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button onClick={() => setOpen(true)} className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">
                    Nueva historia clínica
                </button>
            </div>
            {message ? <p className="rounded-2xl bg-primary-fixed px-5 py-3 text-sm font-bold text-on-primary-fixed">{message}</p> : null}
            <div className="space-y-4">
                {clinicalHistories.map((history) => (
                    <article key={history.id} className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{history.consultation_date?.slice(0, 10)}</p>
                                <h3 className="mt-1 text-xl font-black">{history.patient?.first_name} {history.patient?.last_name}</h3>
                                <p className="mt-2 text-sm text-on-surface-variant">{history.diagnosis || history.reason_for_visit || 'Sin diagnóstico registrado'}</p>
                            </div>
                            <span className="w-fit rounded-full bg-tertiary-fixed px-4 py-2 text-xs font-bold uppercase text-on-tertiary-fixed">Historia</span>
                        </div>
                    </article>
                ))}
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Nueva Historia Clínica" subtitle="Registro conectado al modelo ClinicalHistory">
                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <SelectField name="patient_id" label="Paciente" required>
                            <option value="">Seleccionar</option>
                            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>)}
                        </SelectField>
                        <SelectField name="user_id" label="Registrado por">
                            <option value="">Sin asignar</option>
                            {adminUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </SelectField>
                        <SelectField name="appointment_id" label="Cita asociada">
                            <option value="">Sin cita asociada</option>
                            {appointments.map((appointment) => (
                                <option key={appointment.id} value={appointment.id}>
                                    {appointment.appointment_date?.slice(0, 10)} · {appointment.patient?.first_name} {appointment.patient?.last_name}
                                </option>
                            ))}
                        </SelectField>
                        <Field name="consultation_date" label="Fecha de consulta" type="date" required />
                    </div>
                    <TextArea name="reason_for_visit" label="Motivo de consulta" rows={3} />
                    <TextArea name="symptoms" label="Síntomas" rows={3} />
                    <TextArea name="diagnosis" label="Diagnóstico" rows={3} />
                    <TextArea name="treatment" label="Tratamiento" rows={3} />
                    <TextArea name="prescription" label="Prescripción" rows={3} />
                    <TextArea name="observations" label="Observaciones" rows={3} />
                    <div className="grid gap-5 md:grid-cols-3">
                        <Field name="weight" label="Peso" type="number" step="0.01" />
                        <Field name="height" label="Altura" type="number" step="0.01" />
                        <Field name="blood_pressure" label="Presión arterial" />
                        <Field name="temperature" label="Temperatura" type="number" step="0.1" />
                        <Field name="heart_rate" label="Frecuencia cardíaca" type="number" />
                        <Field name="respiratory_rate" label="Frecuencia respiratoria" type="number" />
                    </div>
                    <button className="rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary">
                        Guardar Historia
                    </button>
                </form>
            </Modal>
        </div>
    );
}
