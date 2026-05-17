import { FormEvent, useState } from 'react';
import { api } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import type { AdminUser } from '../types';

type Props = {
    clinicId: number;
    adminUsers: AdminUser[];
    reload: () => Promise<void>;
};

export function AdminUsersPage({ clinicId, adminUsers, reload }: Props) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await api.createAdminUser({
            clinic_id: clinicId,
            name: String(form.get('name')),
            email: String(form.get('email')),
            password: String(form.get('password')),
            phone: String(form.get('phone') || ''),
            role: 'admin',
            is_active: true,
        });
        setOpen(false);
        setMessage('Administrador registrado correctamente.');
        await reload();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button onClick={() => setOpen(true)} className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">
                    Registrar administrador
                </button>
            </div>
            {message ? <p className="rounded-2xl bg-primary-fixed px-5 py-3 text-sm font-bold text-on-primary-fixed">{message}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
                {adminUsers.map((user) => (
                    <article key={user.id} className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="grid size-12 place-items-center rounded-full bg-primary text-on-primary font-black">
                                {user.name[0]}
                            </div>
                            <div>
                                <h3 className="font-black">{user.name}</h3>
                                <p className="text-sm text-on-surface-variant">{user.email}</p>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-primary">{user.role}</p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
            <Modal open={open} onClose={() => setOpen(false)} title="Nuevo Administrador" subtitle="Usuario con rol admin">
                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field name="name" label="Nombre completo" required />
                        <Field name="email" label="Email" type="email" required />
                        <Field name="phone" label="Teléfono" />
                        <Field name="password" label="Contraseña" type="password" minLength={8} required />
                    </div>
                    <button className="rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary">
                        Guardar Administrador
                    </button>
                </form>
            </Modal>
        </div>
    );
}
