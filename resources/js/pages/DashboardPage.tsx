import { FormEvent, useMemo, useState } from 'react';
import { api } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import type { Appointment } from '../types';

type Props = {
    appointments: Appointment[];
    onCreateAppointment: () => void;
    onCreatePatient: () => void;
    reload: () => Promise<void>;
};

type CalendarView = 'month' | 'week' | 'day';

const viewLabels: Record<CalendarView, string> = {
    month: 'Mes',
    week: 'Semana',
    day: 'Dia',
};

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const monthWeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourSlots = Array.from({ length: 11 }, (_, index) => index + 8);
const dayHourSlots = Array.from({ length: 24 }, (_, index) => index);
const eventColors = [
    'bg-[#8ce3e8] text-[#101817]',
    'bg-[#94e8b4] text-[#101817]',
    'bg-[#a9bdf5] text-[#101817]',
    'bg-[#ffd996] text-[#101817]',
    'bg-[#dcb1f4] text-[#101817]',
];

export function DashboardPage({ appointments, onCreateAppointment, onCreatePatient, reload }: Props) {
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
    const [calendarView, setCalendarView] = useState<CalendarView>('week');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const todayKey = toDateKey(new Date());
    const selectedKey = toDateKey(selectedDate);

    const todayAppointments = useMemo(
        () => appointments.filter((appointment) => normalizeDateKey(appointment.appointment_date) === todayKey),
        [appointments, todayKey],
    );

    const week = useMemo(() => buildWeek(selectedDate), [selectedDate]);
    const monthDays = useMemo(() => buildMonth(selectedDate), [selectedDate]);
    const calendarTitle = getCalendarTitle(selectedDate, calendarView);

    const appointmentsByDate = useMemo(() => {
        return appointments.reduce<Record<string, Appointment[]>>((grouped, appointment) => {
            const key = normalizeDateKey(appointment.appointment_date);
            grouped[key] = [...(grouped[key] ?? []), appointment];
            return grouped;
        }, {});
    }, [appointments]);

    const visibleAppointments =
        calendarView === 'month'
            ? monthDays.flatMap((day) => appointmentsByDate[toDateKey(day)] ?? [])
            : calendarView === 'day'
              ? appointmentsByDate[selectedKey] ?? []
              : week.flatMap((day) => appointmentsByDate[toDateKey(day)] ?? []);

    const moveCalendar = (direction: -1 | 1) => {
        if (calendarView === 'month') {
            setSelectedDate(addMonths(selectedDate, direction));
            return;
        }

        if (calendarView === 'day') {
            setSelectedDate(addDays(selectedDate, direction));
            return;
        }

        setSelectedDate(addDays(selectedDate, direction * 7));
    };

    const markAsServed = async () => {
        if (!selectedAppointment) {
            return;
        }

        await api.updateAppointment(selectedAppointment.id, { status: 'served' });
        setActionMessage('Cita marcada como atendida.');
        await reload();
        setSelectedAppointment((appointment) => (appointment ? { ...appointment, status: 'served' } : appointment));
    };

    const rescheduleAppointment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedAppointment) {
            return;
        }

        const form = new FormData(event.currentTarget);
        const appointmentDate = String(form.get('appointment_date'));
        const startTime = String(form.get('start_time'));
        const endTime = addMinutesToTime(startTime, 45);

        await api.updateAppointment(selectedAppointment.id, {
            appointment_date: appointmentDate,
            start_time: startTime,
            end_time: endTime,
        });
        setActionMessage('Cita reprogramada correctamente.');
        await reload();
        setSelectedAppointment((appointment) =>
            appointment
                ? {
                      ...appointment,
                      appointment_date: appointmentDate,
                      start_time: startTime,
                      end_time: endTime,
                  }
                : appointment,
        );
    };

    return (
        <div className="space-y-6">
            <section className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined rounded-2xl bg-primary-container p-3 text-primary">event_available</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Resumen activo</p>
                            <div className="mt-1 flex items-end gap-3">
                                <p className="text-5xl font-black leading-none text-primary">{todayAppointments.length}</p>
                                <p className="pb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Citas de hoy</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[420px]">
                        <button onClick={onCreateAppointment} className="rounded-2xl bg-primary px-5 py-4 text-sm font-black text-on-primary">
                            Nueva Cita
                        </button>
                        <button onClick={onCreatePatient} className="rounded-2xl bg-surface-container-high px-5 py-4 text-sm font-black text-primary">
                            Registrar Paciente
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Agenda médica</p>
                        <h2 className="mt-1 text-3xl font-black text-on-surface md:text-4xl">{calendarTitle}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="grid grid-cols-3 rounded-2xl bg-surface-container-high p-1 text-sm font-bold">
                            {(Object.keys(viewLabels) as CalendarView[]).map((view) => (
                                <button
                                    key={view}
                                    onClick={() => setCalendarView(view)}
                                    className={`rounded-xl px-5 py-3 ${
                                        calendarView === view ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
                                    }`}
                                >
                                    {viewLabels[view]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => moveCalendar(-1)}
                            className="grid size-12 place-items-center rounded-2xl bg-surface-container-lowest shadow-sm"
                            aria-label="Anterior"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        <button
                            onClick={() => setSelectedDate(startOfDay(new Date()))}
                            className="h-12 rounded-2xl bg-surface-container-lowest px-7 text-sm font-black shadow-sm"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => moveCalendar(1)}
                            className="grid size-12 place-items-center rounded-2xl bg-surface-container-lowest shadow-sm"
                            aria-label="Siguiente"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="overflow-x-auto rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
                {calendarView === 'month' ? (
                    <MonthCalendar
                        appointmentsByDate={appointmentsByDate}
                        monthDays={monthDays}
                        selectedDate={selectedDate}
                        todayKey={todayKey}
                        onSelectDate={setSelectedDate}
                        onSelectAppointment={setSelectedAppointment}
                    />
                ) : null}

                {calendarView === 'week' ? (
                    <WeekCalendar
                        appointmentsByDate={appointmentsByDate}
                        selectedKey={selectedKey}
                        todayKey={todayKey}
                        week={week}
                        onSelectDate={setSelectedDate}
                        onSelectAppointment={setSelectedAppointment}
                    />
                ) : null}

                {calendarView === 'day' ? (
                    <DayCalendar appointments={appointmentsByDate[selectedKey] ?? []} selectedDate={selectedDate} onSelectAppointment={setSelectedAppointment} />
                ) : null}

                {!visibleAppointments.length ? (
                    <div className="border-t border-outline-variant/15 p-8 text-center text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                        Sin citas registradas en esta vista
                    </div>
                ) : null}
            </section>

            <AppointmentDetailModal
                actionMessage={actionMessage}
                appointment={selectedAppointment}
                onClose={() => {
                    setSelectedAppointment(null);
                    setActionMessage(null);
                }}
                onMarkAsServed={markAsServed}
                onReschedule={rescheduleAppointment}
            />
        </div>
    );
}

function MonthCalendar({
    appointmentsByDate,
    monthDays,
    selectedDate,
    todayKey,
    onSelectDate,
    onSelectAppointment,
}: {
    appointmentsByDate: Record<string, Appointment[]>;
    monthDays: Date[];
    selectedDate: Date;
    todayKey: string;
    onSelectDate: (date: Date) => void;
    onSelectAppointment: (appointment: Appointment) => void;
}) {
    return (
        <div className="min-w-[860px]">
            <div className="grid grid-cols-7 border-b border-outline-variant/15">
                {monthWeekDays.map((day) => (
                    <div key={day} className="border-r border-outline-variant/15 px-5 py-4 text-center text-lg font-black text-on-surface last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                    const key = toDateKey(day);
                    const dayAppointments = (appointmentsByDate[key] ?? []).sort((left, right) => left.start_time.localeCompare(right.start_time));
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                    const isToday = key === todayKey;

                    return (
                        <div
                            key={key}
                            onClick={() => onSelectDate(day)}
                            className={`min-h-36 border-b border-r border-outline-variant/15 p-3 text-left last:border-r-0 ${
                                isToday ? 'bg-[#fff8df]' : 'bg-surface-container-lowest'
                            }`}
                        >
                            <div className={`text-right text-xl font-black ${isCurrentMonth ? 'text-on-surface' : 'text-on-surface-variant/40'}`}>
                                {day.getDate()}
                            </div>
                            <div className="mt-4 space-y-2">
                                {dayAppointments.slice(0, 2).map((appointment, index) => (
                                    <button
                                        key={appointment.id}
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onSelectAppointment(appointment);
                                        }}
                                        className={`w-full truncate rounded-lg px-3 py-2 text-left text-xs font-bold ${eventColors[index % eventColors.length]}`}
                                    >
                                        {formatTime(appointment.start_time)} {appointment.patient?.first_name ?? appointment.reason ?? 'Cita'}
                                    </button>
                                ))}
                                {dayAppointments.length > 2 ? (
                                    <div className="px-1 text-sm font-black text-on-surface-variant">+{dayAppointments.length - 2} more</div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function WeekCalendar({
    appointmentsByDate,
    selectedKey,
    todayKey,
    week,
    onSelectDate,
    onSelectAppointment,
}: {
    appointmentsByDate: Record<string, Appointment[]>;
    selectedKey: string;
    todayKey: string;
    week: Date[];
    onSelectDate: (date: Date) => void;
    onSelectAppointment: (appointment: Appointment) => void;
}) {
    return (
        <div className="grid grid-cols-[74px_repeat(7,minmax(138px,1fr))] overflow-x-auto">
            <div className="border-b border-outline-variant/15 p-4 text-xs font-bold text-on-surface-variant">GMT-4</div>
            {week.map((day) => {
                const key = toDateKey(day);
                const isSelected = key === selectedKey;
                const isToday = key === todayKey;

                return (
                    <button
                        key={key}
                        onClick={() => onSelectDate(day)}
                        className={`m-2 flex items-center gap-2 rounded-2xl border px-4 py-3 text-left ${
                            isSelected
                                ? 'border-on-surface bg-surface-container-lowest'
                                : isToday
                                  ? 'border-primary/40 bg-primary-container/40'
                                  : 'border-transparent bg-surface-container-low'
                        }`}
                    >
                        <span className="text-xl font-black">{day.getDate()}</span>
                        <span className="text-sm font-bold text-on-surface-variant">{weekDays[day.getDay()]}</span>
                    </button>
                );
            })}

            <div className="col-span-8 grid grid-cols-[74px_repeat(7,minmax(138px,1fr))]">
                <div className="grid border-r border-outline-variant/15">
                    {hourSlots.map((hour) => (
                        <div key={hour} className="h-28 border-t border-outline-variant/15 px-4 pt-3 text-sm font-bold text-on-surface-variant">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {week.map((day, dayIndex) => {
                    const key = toDateKey(day);
                    const dayAppointments = (appointmentsByDate[key] ?? []).sort((left, right) => left.start_time.localeCompare(right.start_time));

                    return (
                        <div key={key} className="relative border-r border-outline-variant/15 last:border-r-0">
                            {hourSlots.map((hour) => (
                                <div key={hour} className="h-28 border-t border-outline-variant/15" />
                            ))}

                            {dayAppointments.map((appointment, appointmentIndex) => (
                                <CalendarEvent
                                    key={appointment.id}
                                    appointment={appointment}
                                    colorClass={eventColors[(dayIndex + appointmentIndex) % eventColors.length]}
                                    onSelect={onSelectAppointment}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DayCalendar({
    appointments,
    selectedDate,
    onSelectAppointment,
}: {
    appointments: Appointment[];
    selectedDate: Date;
    onSelectAppointment: (appointment: Appointment) => void;
}) {
    const sortedAppointments = [...appointments].sort((left, right) => left.start_time.localeCompare(right.start_time));

    return (
        <div className="min-w-[720px]">
            <div className="grid grid-cols-[92px_1fr] border-b border-outline-variant/15">
                <div className="border-r border-outline-variant/15" />
                <div className="px-5 py-4 text-center text-lg font-black text-on-surface">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
            </div>
            <div className="grid grid-cols-[92px_1fr] border-b border-outline-variant/15">
                <div className="border-r border-outline-variant/15 px-3 py-8 text-xl font-black text-on-surface">all-day</div>
                <div />
            </div>
            <div className="grid grid-cols-[92px_1fr]">
                <div className="grid border-r border-outline-variant/15">
                    {dayHourSlots.map((hour) => (
                        <div key={hour} className="h-24 border-t border-outline-variant/15 px-3 pt-5 text-right text-xl font-black text-on-surface">
                            {formatHourLabel(hour)}
                        </div>
                    ))}
                </div>

                <div className="relative">
                    {dayHourSlots.map((hour) => (
                        <div key={hour} className="h-24 border-t border-outline-variant/15" />
                    ))}

                    {sortedAppointments.map((appointment, index) => (
                        <DayEvent key={appointment.id} appointment={appointment} colorClass={eventColors[index % eventColors.length]} onSelect={onSelectAppointment} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function CalendarEvent({
    appointment,
    colorClass,
    onSelect,
}: {
    appointment: Appointment;
    colorClass: string;
    onSelect: (appointment: Appointment) => void;
}) {
    const start = parseTime(appointment.start_time);
    const end = appointment.end_time ? parseTime(appointment.end_time) : start + 60;
    const top = Math.max(0, ((start - 8 * 60) / 60) * 112 + 10);
    const height = Math.max(72, ((Math.max(end, start + 30) - start) / 60) * 112 - 10);
    const patientName = [appointment.patient?.first_name, appointment.patient?.last_name].filter(Boolean).join(' ') || 'Paciente';

    return (
        <button
            type="button"
            onClick={() => onSelect(appointment)}
            className={`absolute left-2 right-2 overflow-hidden rounded-2xl p-4 shadow-sm ${colorClass}`}
            style={{ top, height }}
            title={`${formatTime(appointment.start_time)} ${appointment.reason ?? ''}`}
        >
            <p className="text-sm font-black">
                {formatTime(appointment.start_time)}
                {appointment.end_time ? `-${formatTime(appointment.end_time)}` : ''}
            </p>
            <h3 className="mt-1 line-clamp-2 text-sm font-black leading-tight">{patientName}</h3>
            <p className="mt-1 line-clamp-2 text-xs font-semibold opacity-80">{appointment.reason || 'Consulta médica'}</p>
            
        </button>
    );
}

function DayEvent({
    appointment,
    colorClass,
    onSelect,
}: {
    appointment: Appointment;
    colorClass: string;
    onSelect: (appointment: Appointment) => void;
}) {
    const start = parseTime(appointment.start_time);
    const end = appointment.end_time ? parseTime(appointment.end_time) : start + 60;
    const top = Math.max(0, (start / 60) * 96 + 8);
    const height = Math.max(72, ((Math.max(end, start + 30) - start) / 60) * 96 - 8);
    const patientName = [appointment.patient?.first_name, appointment.patient?.last_name].filter(Boolean).join(' ') || 'Paciente';

    return (
        <button type="button" onClick={() => onSelect(appointment)} className={`absolute left-4 right-4 rounded-2xl p-4 text-left shadow-sm ${colorClass}`} style={{ top, height }}>
            <p className="text-sm font-black">
                {formatTime(appointment.start_time)}
                {appointment.end_time ? `-${formatTime(appointment.end_time)}` : ''}
            </p>
            <h3 className="mt-1 text-base font-black">{patientName}</h3>
            <p className="mt-1 text-sm font-semibold opacity-80">{appointment.reason || 'Consulta médica'}</p>
        </button>
    );
}

function AppointmentDetailModal({
    actionMessage,
    appointment,
    onClose,
    onMarkAsServed,
    onReschedule,
}: {
    actionMessage: string | null;
    appointment: Appointment | null;
    onClose: () => void;
    onMarkAsServed: () => Promise<void>;
    onReschedule: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
    const patientName = appointment ? [appointment.patient?.first_name, appointment.patient?.last_name].filter(Boolean).join(' ') || 'Paciente' : '';
    const whatsappUrl = appointment ? buildWhatsAppUrl(appointment) : '#';

    return (
        <Modal open={Boolean(appointment)} onClose={onClose} title="Detalle de la Cita" subtitle="Información y acciones rápidas">
            {appointment ? (
                <div className="space-y-6">
                    {actionMessage ? <p className="rounded-2xl bg-primary-fixed px-5 py-3 text-sm font-bold text-on-primary-fixed">{actionMessage}</p> : null}

                    <div className="grid gap-4 rounded-3xl bg-surface-container-low p-5 md:grid-cols-2">
                        <DetailItem label="Paciente" value={patientName} />
                        <DetailItem label="Teléfono" value={appointment.patient?.phone || 'Sin teléfono'} />
                        <DetailItem label="Fecha" value={normalizeDateKey(appointment.appointment_date)} />
                        <DetailItem label="Horario" value={`${formatTime(appointment.start_time)}${appointment.end_time ? ` - ${formatTime(appointment.end_time)}` : ''}`} />
                        <DetailItem label="Estado" value={translateStatus(appointment.status)} />
                        <DetailItem label="Motivo" value={appointment.reason || 'Consulta médica'} />
                    </div>

                    <button onClick={onMarkAsServed} className="w-full rounded-2xl bg-primary px-6 py-4 font-black text-on-primary">
                        Cambiar estado a atendido
                    </button>

                    <form onSubmit={onReschedule} className="rounded-3xl border border-outline-variant/15 p-5">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Reprogramar cita</p>
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                            <Field name="appointment_date" label="Nueva fecha" type="date" defaultValue={normalizeDateKey(appointment.appointment_date)} required />
                            <Field name="start_time" label="Hora inicio" type="time" defaultValue={formatTime(appointment.start_time)} required />
                            <button className="rounded-2xl bg-surface-container-high px-6 py-4 text-sm font-black text-primary">
                                Reprogramar
                            </button>
                        </div>
                        <p className="mt-3 text-xs font-bold text-on-surface-variant">Duración por defecto: 45 minutos.</p>
                    </form>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`block rounded-2xl px-6 py-4 text-center font-black ${
                            appointment.patient?.phone ? 'bg-[#25d366] text-white' : 'pointer-events-none bg-surface-container-high text-on-surface-variant'
                        }`}
                    >
                        Abrir WhatsApp
                    </a>
                </div>
            ) : null}
        </Modal>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className="mt-1 text-sm font-black text-on-surface">{value}</p>
        </div>
    );
}

function buildWeek(date: Date) {
    const start = addDays(startOfDay(date), -date.getDay());
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function buildMonth(date: Date) {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = addDays(firstOfMonth, -firstOfMonth.getDay());
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return startOfDay(next);
}

function addMonths(date: Date, months: number) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return startOfDay(next);
}

function startOfDay(date: Date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normalizeDateKey(value: string) {
    return value.slice(0, 10);
}

function parseTime(value: string) {
    const [hours = '0', minutes = '0'] = value.split(':');
    return Number(hours) * 60 + Number(minutes);
}

function formatTime(value: string) {
    return value.slice(0, 5);
}

function addMinutesToTime(value: string, minutesToAdd: number) {
    const totalMinutes = parseTime(value) + minutesToAdd;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
}

function formatHourLabel(hour: number) {
    if (hour === 0) {
        return '12am';
    }

    if (hour < 12) {
        return `${hour}am`;
    }

    if (hour === 12) {
        return '12pm';
    }

    return `${hour - 12}pm`;
}

function getCalendarTitle(date: Date, view: CalendarView) {
    if (view === 'day') {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    }

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
}

function translateStatus(status: Appointment['status']) {
    const labels: Record<Appointment['status'], string> = {
        scheduled: 'Programada',
        confirmed: 'Confirmada',
        completed: 'Completada',
        served: 'Atendida',
        cancelled: 'Cancelada',
        no_show: 'No asistió',
    };

    return labels[status];
}

function buildWhatsAppUrl(appointment: Appointment) {
    const phone = appointment.patient?.phone?.replace(/\D/g, '');

    if (!phone) {
        return '#';
    }

    const patientName = [appointment.patient?.first_name, appointment.patient?.last_name].filter(Boolean).join(' ') || 'paciente';
    const message = `Hola ${patientName}, le recordamos su cita médica para el ${normalizeDateKey(appointment.appointment_date)} a las ${formatTime(appointment.start_time)}.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
