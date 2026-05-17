import type { Tab } from '../types';

type Props = {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
};

const navItems: Array<{ id: Tab; icon: string; label: string }> = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'patients', icon: 'group', label: 'Pacientes' },
    { id: 'appointments', icon: 'event', label: 'Citas' },
    { id: 'clinicalHistories', icon: 'history_edu', label: 'Historias' },
    { id: 'adminUsers', icon: 'admin_panel_settings', label: 'Administradores' },
];

export function Sidebar({ activeTab, onTabChange }: Props) {
    return (
        <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col gap-4 bg-surface-container-low px-4 py-8">
            <div className="mb-8 flex items-center gap-3 px-4">
                <div className="grid size-10 place-items-center rounded-xl bg-primary text-on-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-primary">PLENNA</h1>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Consultorio</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                            activeTab === item.id
                                ? 'bg-surface-container-high font-bold text-primary'
                                : 'text-on-surface-variant opacity-75 hover:bg-surface-container-highest'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="flex-1 text-left text-xs uppercase tracking-wider">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}
