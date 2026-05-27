import { FormEvent, useMemo, useState } from 'react';
import { api } from '../api';
import { Field, SelectField, TextArea } from '../components/Field';
import { Modal } from '../components/Modal';
import type { AdminUser, Appointment, Patient, Payment, Service } from '../types';

type PaymentDraftItem = {
    id: string;
    serviceId: string;
    quantity: number;
    discount: number;
};

type Props = {
    clinicId: number;
    adminUsers: AdminUser[];
    appointments: Appointment[];
    patients: Patient[];
    payments: Payment[];
    services: Service[];
    reload: () => Promise<void>;
};

const statusLabels: Record<Payment['payment_status'], string> = {
    unpaid: 'Pendiente',
    partial: 'Parcial',
    paid: 'Pagado',
    cancelled: 'Cancelado',
};

const methodLabels = {
    cash: 'Efectivo',
    qr: 'QR',
    card: 'Tarjeta',
    bank_transfer: 'Transferencia',
    other: 'Otro',
};

export function PaymentsPage({ clinicId, adminUsers, appointments, patients, payments, services, reload }: Props) {
    const [open, setOpen] = useState(false);
    const [serviceOpen, setServiceOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [items, setItems] = useState<PaymentDraftItem[]>([newDraftItem()]);

    const activeServices = services.filter((service) => service.is_active);

    const itemPreview = useMemo(() => {
        return items.map((item) => {
            const service = activeServices.find((candidate) => candidate.id === Number(item.serviceId));
            const unitPrice = Number(service?.price ?? 0);
            const total = Math.max(item.quantity * unitPrice - item.discount, 0);

            return { ...item, service, unitPrice, total };
        });
    }, [activeServices, items]);

    const subtotal = itemPreview.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountTotal = itemPreview.reduce((sum, item) => sum + item.discount, 0);
    const total = Math.max(subtotal - discountTotal, 0);

    const updateItem = (id: string, patch: Partial<PaymentDraftItem>) => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    };

    const removeItem = (id: string) => {
        setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const initialAmount = Number(form.get('initial_amount') || 0);

        await api.createPayment({
            clinic_id: clinicId,
            patient_id: Number(form.get('patient_id')),
            appointment_id: Number(form.get('appointment_id')) || null,
            created_by: Number(form.get('created_by')) || null,
            payment_date: String(form.get('payment_date')),
            notes: String(form.get('notes') || ''),
            items: itemPreview.map((item) => ({
                service_id: item.service?.id,
                quantity: item.quantity,
                discount: item.discount,
                status: 'pending',
            })),
            initial_payment:
                initialAmount > 0
                    ? {
                          amount: initialAmount,
                          method: String(form.get('initial_method')),
                          transaction_date: String(form.get('payment_date')),
                          received_by: Number(form.get('created_by')) || null,
                          reference: String(form.get('initial_reference') || ''),
                          status: 'confirmed',
                      }
                    : null,
        });

        setOpen(false);
        setItems([newDraftItem()]);
        setMessage('Pago registrado correctamente.');
        await reload();
    };

    const submitService = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        await api.createService({
            clinic_id: clinicId,
            name: String(form.get('name')),
            description: String(form.get('description') || ''),
            type: String(form.get('type')) as Service['type'],
            price: String(form.get('price')),
            is_active: true,
        });

        setServiceOpen(false);
        setMessage('Servicio registrado correctamente.');
        await reload();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-end gap-3">
                <button onClick={() => setServiceOpen(true)} className="rounded-2xl bg-surface-container-high px-6 py-3 text-sm font-bold text-primary">
                    Nuevo servicio
                </button>
                <button onClick={() => setOpen(true)} className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">
                    Registrar pago
                </button>
            </div>

            {message ? <p className="rounded-2xl bg-primary-fixed px-5 py-3 text-sm font-bold text-on-primary-fixed">{message}</p> : null}

            <div className="grid gap-4 md:grid-cols-4">
                <Metric label="Total cobrado" value={formatMoney(payments.reduce((sum, payment) => sum + Number(payment.paid_amount), 0))} />
                <Metric label="Saldo pendiente" value={formatMoney(payments.reduce((sum, payment) => sum + Number(payment.balance), 0))} />
                <Metric label="Pagos registrados" value={String(payments.length)} />
                <Metric label="Servicios activos" value={String(activeServices.length)} />
            </div>

            <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
                <PaymentsTable payments={payments} />
            </div>

            <Modal open={open} onClose={() => setOpen(false)} title="Registrar Pago" subtitle="Cuenta del paciente y servicios incluidos">
                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <SelectField name="patient_id" label="Paciente" required>
                            <option value="">Seleccionar</option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.first_name} {patient.last_name}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField name="appointment_id" label="Cita relacionada">
                            <option value="">Sin cita</option>
                            {appointments.map((appointment) => (
                                <option key={appointment.id} value={appointment.id}>
                                    {appointment.appointment_date?.slice(0, 10)} · {appointment.start_time} · {appointment.patient?.first_name}
                                </option>
                            ))}
                        </SelectField>
                        <Field name="payment_date" label="Fecha de pago" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                        <SelectField name="created_by" label="Registrado por">
                            <option value="">Sin asignar</option>
                            {adminUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <section className="rounded-3xl border border-outline-variant/15 p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Servicios</p>
                                <p className="text-sm text-on-surface-variant">Agrega uno o varios servicios al pago.</p>
                            </div>
                            <button type="button" onClick={() => setItems((current) => [...current, newDraftItem()])} className="rounded-2xl bg-surface-container-high px-4 py-3 text-sm font-black text-primary">
                                Agregar
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {items.map((item, index) => {
                                const preview = itemPreview[index];

                                return (
                                    <div key={item.id} className="grid gap-3 rounded-2xl bg-surface-container-low p-4 lg:grid-cols-[1fr_110px_130px_120px_auto] lg:items-end">
                                        <SelectField
                                            label="Servicio"
                                            value={item.serviceId}
                                            onChange={(event) => updateItem(item.id, { serviceId: event.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar</option>
                                            {activeServices.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} · {formatMoney(service.price)}
                                                </option>
                                            ))}
                                        </SelectField>
                                        <Field
                                            label="Cantidad"
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) || 1 })}
                                            required
                                        />
                                        <Field
                                            label="Descuento"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.discount}
                                            onChange={(event) => updateItem(item.id, { discount: Number(event.target.value) || 0 })}
                                        />
                                        <div>
                                            <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</p>
                                            <p className="rounded-2xl bg-surface-container-lowest px-4 py-3.5 text-sm font-black">{formatMoney(preview?.total ?? 0)}</p>
                                        </div>
                                        <button type="button" onClick={() => removeItem(item.id)} className="grid size-12 place-items-center rounded-2xl bg-surface-container-high text-primary">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-5 grid gap-3 rounded-2xl bg-surface-container-low p-4 text-sm font-black md:grid-cols-3">
                            <p>Subtotal: {formatMoney(subtotal)}</p>
                            <p>Descuentos: {formatMoney(discountTotal)}</p>
                            <p>Total: {formatMoney(total)}</p>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-outline-variant/15 p-5">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Abono inicial opcional</p>
                        <div className="grid gap-5 md:grid-cols-3">
                            <Field name="initial_amount" label="Monto abonado" type="number" min="0" step="0.01" />
                            <SelectField name="initial_method" label="Método" defaultValue="cash">
                                {Object.entries(methodLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </SelectField>
                            <Field name="initial_reference" label="Referencia" />
                        </div>
                    </section>

                    <TextArea name="notes" label="Notas" rows={3} />

                    <button className="rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary">
                        Guardar Pago
                    </button>
                </form>
            </Modal>

            <Modal open={serviceOpen} onClose={() => setServiceOpen(false)} title="Nuevo Servicio" subtitle="Catálogo médico o laboratorio">
                <form onSubmit={submitService} className="grid gap-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field name="name" label="Nombre" required />
                        <SelectField name="type" label="Tipo" defaultValue="consultation" required>
                            <option value="consultation">Consulta</option>
                            <option value="laboratory">Laboratorio</option>
                            <option value="procedure">Procedimiento</option>
                            <option value="other">Otro</option>
                        </SelectField>
                        <Field name="price" label="Precio" type="number" min="0" step="0.01" required />
                    </div>
                    <TextArea name="description" label="Descripción" rows={3} />
                    <button className="rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-on-primary">
                        Guardar Servicio
                    </button>
                </form>
            </Modal>
        </div>
    );
}

function PaymentsTable({ payments }: { payments: Payment[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-surface-container-high/50 text-on-surface-variant">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Pago</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Paciente</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Total</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Pagado</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Saldo</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                    {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-surface-container-low">
                            <td className="px-6 py-5">
                                <p className="text-sm font-black">{payment.payment_number}</p>
                                <p className="text-xs text-on-surface-variant">{payment.payment_date?.slice(0, 10)}</p>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold">
                                {payment.patient?.first_name} {payment.patient?.last_name}
                            </td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant">{formatMoney(payment.total)}</td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant">{formatMoney(payment.paid_amount)}</td>
                            <td className="px-6 py-5 text-sm text-on-surface-variant">{formatMoney(payment.balance)}</td>
                            <td className="px-6 py-5">
                                <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
                                    {statusLabels[payment.payment_status]}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
            <p className="mt-2 text-2xl font-black text-primary">{value}</p>
        </div>
    );
}

function newDraftItem(): PaymentDraftItem {
    return {
        id: crypto.randomUUID(),
        serviceId: '',
        quantity: 1,
        discount: 0,
    };
}

function formatMoney(value: string | number) {
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
    }).format(Number(value));
}
