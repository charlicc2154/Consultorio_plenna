import type { AdminUser, ApiEnvelope, Appointment, ClinicalHistory, Clinic, Paginated, Patient } from './types';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    });

    const result = await response.json().catch(() => ({ message: 'Respuesta invalida del servidor.' }));

    if (!response.ok) {
        const errors = result.errors ? Object.values(result.errors).flat().join(' ') : '';
        throw new Error(errors || result.message || 'No se pudo completar la accion.');
    }

    return result as T;
}

function toBody(payload: unknown): RequestInit {
    return {
        method: 'POST',
        body: JSON.stringify(payload),
    };
}

function toPatch(payload: unknown): RequestInit {
    return {
        method: 'PATCH',
        body: JSON.stringify(payload),
    };
}

export const api = {
    async clinics() {
        return request<ApiEnvelope<Clinic[]>>('/api/clinics');
    },
    async patients() {
        return request<ApiEnvelope<Paginated<Patient>>>('/api/patients');
    },
    async createPatient(payload: Partial<Patient>) {
        return request<ApiEnvelope<Patient>>('/api/patients', toBody(payload));
    },
    async appointments() {
        return request<ApiEnvelope<Paginated<Appointment>>>('/api/appointments');
    },
    async createAppointment(payload: Partial<Appointment>) {
        return request<ApiEnvelope<Appointment>>('/api/appointments', toBody(payload));
    },
    async updateAppointment(id: number, payload: Partial<Appointment>) {
        return request<ApiEnvelope<Appointment>>(`/api/appointments/${id}`, toPatch(payload));
    },
    async clinicalHistories() {
        return request<ApiEnvelope<Paginated<ClinicalHistory>>>('/api/clinical-histories');
    },
    async createClinicalHistory(payload: Partial<ClinicalHistory>) {
        return request<ApiEnvelope<ClinicalHistory>>('/api/clinical-histories', toBody(payload));
    },
    async adminUsers() {
        return request<ApiEnvelope<Paginated<AdminUser>>>('/api/admin-users');
    },
    async createAdminUser(payload: Partial<AdminUser> & { password: string }) {
        return request<ApiEnvelope<AdminUser>>('/api/admin-users', toBody(payload));
    },
};
