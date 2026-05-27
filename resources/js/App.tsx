import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from './api';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ClinicalHistoriesPage } from './pages/ClinicalHistoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PatientsPage } from './pages/PatientsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import type { AdminUser, Appointment, ClinicalHistory, Clinic, Patient, Payment, Service, Tab } from './types';

const titles: Record<Tab, string> = {
    dashboard: 'Turno del día',
    patients: 'Gestión de Pacientes',
    appointments: 'Agenda Médica',
    payments: 'Pagos y Servicios',
    clinicalHistories: 'Historias Clínicas',
    adminUsers: 'Usuarios Administradores',
};

export function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clinicalHistories, setClinicalHistories] = useState<ClinicalHistory[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const today = useMemo(() => new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }), []);
    const clinicId = clinics[0]?.id ?? 1;

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [clinicResponse, patientResponse, appointmentResponse, historyResponse, adminResponse, serviceResponse, paymentResponse] = await Promise.all([
                api.clinics(),
                api.patients(),
                api.appointments(),
                api.clinicalHistories(),
                api.adminUsers(),
                api.services(),
                api.payments(),
            ]);
            setClinics(clinicResponse.data);
            setPatients(patientResponse.data.data);
            setAppointments(appointmentResponse.data.data);
            setClinicalHistories(historyResponse.data.data);
            setAdminUsers(adminResponse.data.data);
            setServices(serviceResponse.data.data);
            setPayments(paymentResponse.data.data);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'No se pudo cargar la información.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loggedIn) {
            void loadData();
        }
    }, [loggedIn]);

    if (!loggedIn) {
        return <LoginPage onLogin={() => setLoggedIn(true)} />;
    }

    return (
        <div className="min-h-screen bg-surface">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="px-4 py-6 pb-28 md:ml-64 md:px-12 md:py-12 lg:px-16">
                <TopBar title={titles[activeTab]} subtitle={today} />

                {error ? (
                    <div className="mb-6 rounded-2xl bg-error-container px-5 py-4 text-sm font-bold text-on-error-container">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="rounded-[2rem] bg-surface-container-lowest p-10 text-center text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                        Cargando datos clínicos...
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.18 }}
                        >
                            {activeTab === 'dashboard' && (
                                <DashboardPage
                                    appointments={appointments}
                                    onCreateAppointment={() => setActiveTab('appointments')}
                                    onCreatePatient={() => setActiveTab('patients')}
                                    reload={loadData}
                                />
                            )}
                            {activeTab === 'patients' && (
                                <PatientsPage clinicId={clinicId} patients={patients} reload={loadData} />
                            )}
                            {activeTab === 'appointments' && (
                                <AppointmentsPage
                                    clinicId={clinicId}
                                    patients={patients}
                                    adminUsers={adminUsers}
                                    appointments={appointments}
                                    reload={loadData}
                                />
                            )}
                            {activeTab === 'payments' && (
                                <PaymentsPage
                                    clinicId={clinicId}
                                    adminUsers={adminUsers}
                                    appointments={appointments}
                                    patients={patients}
                                    payments={payments}
                                    services={services}
                                    reload={loadData}
                                />
                            )}
                            {activeTab === 'clinicalHistories' && (
                                <ClinicalHistoriesPage
                                    clinicId={clinicId}
                                    patients={patients}
                                    adminUsers={adminUsers}
                                    appointments={appointments}
                                    clinicalHistories={clinicalHistories}
                                    reload={loadData}
                                />
                            )}
                            {activeTab === 'adminUsers' && (
                                <AdminUsersPage clinicId={clinicId} adminUsers={adminUsers} reload={loadData} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around rounded-t-3xl border-t border-outline-variant/15 bg-surface/80 px-3 pb-5 pt-3 shadow-[0_-4px_24px_rgba(25,28,27,0.04)] backdrop-blur-2xl md:hidden">
                {[
                    ['dashboard', 'home', 'Inicio'],
                    ['appointments', 'event', 'Agenda'],
                    ['payments', 'payments', 'Pagos'],
                    ['patients', 'group', 'Pacientes'],
                    ['adminUsers', 'admin_panel_settings', 'Admins'],
                ].map(([tab, icon, label]) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`grid justify-items-center rounded-2xl px-4 py-2 text-xs font-bold ${
                            activeTab === tab ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
                        }`}
                    >
                        <span className="material-symbols-outlined">{icon}</span>
                        <span className="text-[10px] uppercase tracking-wider">{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
