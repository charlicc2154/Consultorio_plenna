import { FormEvent, useState } from 'react';
import { api } from '../api';
import { Field, SelectField, TextArea } from '../components/Field';
import { Modal } from '../components/Modal';
import type { Patient } from '../types';

type Props = {
    clinicId: number;
    patients: Patient[];
    reload: () => Promise<void>;
};

export function PatientsPage({ clinicId, patients, reload }: Props) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await api.createPatient({
            clinic_id: clinicId,
            first_name: String(form.get('first_name')),
            last_name: String(form.get('last_name')),
            document_type: String(form.get('document_type') || ''),
            document_number: String(form.get('document_number') || ''),
            birth_date: String(form.get('birth_date') || '') || null,
            gender: (String(form.get('gender') || '') || null) as Patient['gender'],
            phone: String(form.get('phone') || ''),
            email: String(form.get('email') || ''),
            address: String(form.get('address') || ''),
            emergency_contact_name: String(form.get('emergency_contact_name') || ''),
            emergency_contact_phone: String(form.get('emergency_contact_phone') || ''),
            blood_type: String(form.get('blood_type') || ''),
            allergies: String(form.get('allergies') || ''),
            medical_notes: String(form.get('medical_notes') || ''),
            is_active: true,
        });
        setOpen(false);
        setMessage('Paciente registrado correctamente.');
        await reload();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button onClick={() => setOpen(true)} className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">
                    Registrar paciente
                </button>
            </div>
            {message ? <p className="rounded-2xl bg-primary-fixed px-5 py-3 text-sm font-bold text-on-primary-fixed">{message}</p> : null}
            <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
                <Table patients={patients} />
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Nuevo Paciente" subtitle="Datos generales y clínicos">
                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field name="first_name" label="Nombre" required />
                        <Field name="last_name" label="Apellido" required />
                        <Field name="document_type" label="Tipo de documento" />
                        <Field name="document_number" label="Número de documento" />
                        <Field name="birth_date" label="Fecha de nacimiento" type="date" />
                        <SelectField name="gender" label="Género" defaultValue="">
                            <option value="">Sin especificar</option>
                            <option value="female">Femenino</option>
                            <option value="male">Masculino</option>
                            <option value="other">Otro</option>
                        </SelectField>
                        <Field name="phone" label="Teléfono" />
                        <Field name="email" label="Email" type="email" />
                        <Field name="address" label="Dirección" />
                        <Field name="blood_type" label="Tipo de sangre" />
                        <Field name="emergency_contact_name" label="Contacto de emergencia" />
                        <Field name="emergency_contact_phone" label="Teléfono de emergencia" />
                    </div>
                    <TextArea name="allergies" label="Alergias" rows={3} />
                    <TextArea name="medical_notes" label="Notas médicas" rows={4} />
                    <button className="rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary">
                        Guardar Paciente
                    </button>
                </form>
            </Modal>
        </div>
    );
}

function Table({ patients }: { patients: Patient[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-surface-container-high/50 text-on-surface-variant">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Paciente</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Documento</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Teléfono</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Sangre</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                    {patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-surface-container-low">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="grid size-10 place-items-center rounded-full bg-primary-fixed font-bold text-primary">
                                        {patient.first_name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{patient.first_name} {patient.last_name}</p>
                                        <p className="text-xs text-on-surface-variant">{patient.email || 'Sin email'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant">{patient.document_number || '—'}</td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant">{patient.phone || '—'}</td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant">{patient.blood_type || '—'}</td>
                            <td className="px-6 py-5">
                                <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
                                    {patient.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
