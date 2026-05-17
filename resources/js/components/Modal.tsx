import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Props = {
    title: string;
    subtitle?: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export function Modal({ title, subtitle, open, onClose, children }: Props) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-on-surface/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 18 }}
                        className="fixed inset-0 z-50 m-auto flex h-fit max-h-[92vh] w-[calc(100%-1rem)] max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest shadow-2xl"
                    >
                        <header className="flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low/40 p-7">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-primary">{title}</h2>
                                {subtitle ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{subtitle}</p> : null}
                            </div>
                            <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-surface-container-high">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </header>
                        <div className="overflow-y-auto p-7">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
