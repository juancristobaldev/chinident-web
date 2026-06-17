export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "ADMIN" | "OWNER" | "DENTIST" | "PATIENT";
  tenantId: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  themeColor?: string;
  tenantName?: string;
}

export interface Tenant {
  id: string;
  name: string;
  rut: string;
  businessName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  themeColor: string;
  isActive: boolean;
  planType: string;
  owner: Pick<User, "id" | "email" | "firstName" | "lastName"> | null;
  _count?: {
    locales: number;
    dentists: number;
    patients: number;
  };
}

export interface Locale {
  id: string;
  tenantId: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

export interface Dentist {
  id: string;
  userId: string;
  tenantId: string;
  specialty: string | null;
  licenseNumber: string | null;
  isActive: boolean;
  user: Pick<User, "id" | "email" | "firstName" | "lastName" | "phone" | "avatarUrl">;
}

export interface Patient {
  id: string;
  tenantId: string;
  rut: string | null;
  dob: string | null;
  sex: string | null;
  address: string | null;
  isActive: boolean;
  user: Pick<User, "id" | "email" | "firstName" | "lastName" | "phone" | "avatarUrl"> | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  localeId: string;
  boxId: string | null;
  startTime: string;
  endTime: string;
  status: "RESERVADA" | "CONFIRMADA" | "EN_ATENCION" | "FINALIZADA" | "CANCELADA" | "NO_ASISTIO";
  type: string | null;
  notes: string | null;
  patient: Patient;
  dentist: User;
}

export interface AuthResponse {
  user: User;
}

export interface Attachment {
  id: string;
  entityType: "PATIENT" | "TREATMENT" | "EVOLUTION" | "ODONTOGRAM" | "BUDGET";
  entityId: string;
  patientId: string | null;
  treatmentPlanId: string | null;
  clinicalRecordId: string | null;
  fileUrl: string;
  fileType: "IMAGE" | "XRAY" | "DOCUMENT" | "PRESCRIPTION";
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}
