export type Tab = 'dashboard' | 'patients' | 'appointments' | 'clinicalHistories' | 'adminUsers';

export type Clinic = {
    id: number;
    name: string;
    legal_name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    status: 'active' | 'inactive';
};

export type AdminUser = {
    id: number;
    clinic_id?: number | null;
    name: string;
    email: string;
    phone?: string | null;
    role: 'admin';
    is_active: boolean;
};

export type Patient = {
    id: number;
    clinic_id: number;
    first_name: string;
    last_name: string;
    document_type?: string | null;
    document_number?: string | null;
    birth_date?: string | null;
    gender?: 'male' | 'female' | 'other' | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    blood_type?: string | null;
    allergies?: string | null;
    medical_notes?: string | null;
    is_active: boolean;
};

export type Appointment = {
    id: number;
    clinic_id: number;
    patient_id: number;
    user_id?: number | null;
    appointment_date: string;
    start_time: string;
    end_time?: string | null;
    reason?: string | null;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    notes?: string | null;
    patient?: Patient;
    user?: AdminUser | null;
};

export type ClinicalHistory = {
    id: number;
    clinic_id: number;
    patient_id: number;
    user_id?: number | null;
    appointment_id?: number | null;
    consultation_date: string;
    reason_for_visit?: string | null;
    symptoms?: string | null;
    diagnosis?: string | null;
    treatment?: string | null;
    prescription?: string | null;
    observations?: string | null;
    weight?: string | null;
    height?: string | null;
    blood_pressure?: string | null;
    temperature?: string | null;
    heart_rate?: number | null;
    respiratory_rate?: number | null;
    patient?: Patient;
    user?: AdminUser | null;
    appointment?: Appointment | null;
};

export type Paginated<T> = {
    data: T[];
};

export type ApiEnvelope<T> = {
    message: string;
    data: T;
};
