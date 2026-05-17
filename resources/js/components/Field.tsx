import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};

export function Field({ label, ...props }: FieldProps) {
    return (
        <label className="grid gap-1">
            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
            <input {...props} className="w-full rounded-2xl border-none bg-surface-container-low px-4 py-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20" />
        </label>
    );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
};

export function SelectField({ label, children, ...props }: SelectProps) {
    return (
        <label className="grid gap-1">
            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
            <select {...props} className="w-full rounded-2xl border-none bg-surface-container-low px-4 py-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20">
                {children}
            </select>
        </label>
    );
}

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
};

export function TextArea({ label, ...props }: AreaProps) {
    return (
        <label className="grid gap-1">
            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
            <textarea {...props} className="w-full resize-none rounded-2xl border-none bg-surface-container-low px-4 py-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20" />
        </label>
    );
}
