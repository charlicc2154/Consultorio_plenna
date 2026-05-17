type Props = {
    title: string;
    subtitle: string;
};

export function TopBar({ title, subtitle }: Props) {
    return (
        <header className="mb-10 flex items-center justify-between gap-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-on-surface">{title}</h2>
                <p className="font-medium capitalize text-on-surface-variant">{subtitle}</p>
            </div>
            <div className="hidden items-center gap-3 rounded-full bg-tertiary-fixed px-4 py-2 text-on-tertiary-fixed md:flex">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="text-xs font-bold uppercase tracking-wider">API conectada</span>
            </div>
        </header>
    );
}
