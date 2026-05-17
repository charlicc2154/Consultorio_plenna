import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';

type Props = {
    onLogin: () => void;
};

export function LoginPage({ onLogin }: Props) {
    const [loading, setLoading] = useState(false);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        window.setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 350);
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 md:p-8">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#dde5d2_0%,_#f9faf8_52%)]" />
            <motion.main initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
                <header className="mb-12 text-center">
                    <h1 className="mb-2 text-5xl font-extrabold tracking-tighter text-primary">PLENNA</h1>
                    <div className="mx-auto h-1 w-12 rounded-full bg-primary" />
                </header>

                <section className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-low p-8 shadow-sm md:p-12">
                    <div className="mb-10 text-center">
                        <h2 className="mb-3 text-3xl font-bold tracking-tight text-on-surface">Acceso al Portal Clínico</h2>
                        <p className="font-medium text-on-surface-variant">Interfaz conectada a la API local del consultorio.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <label className="grid gap-1">
                            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email institucional</span>
                            <input required type="text" inputMode="email" placeholder="admin@consultorio.bo" className="rounded-xl border-none bg-surface-container-lowest px-4 py-3.5 focus:ring-2 focus:ring-primary/20" />
                        </label>
                        <label className="grid gap-1">
                            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Contraseña</span>
                            <input required type="password" placeholder="••••••••" className="rounded-xl border-none bg-surface-container-lowest px-4 py-3.5 focus:ring-2 focus:ring-primary/20" />
                        </label>
                        <button disabled={loading} className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-60">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                </section>
            </motion.main>
        </div>
    );
}
