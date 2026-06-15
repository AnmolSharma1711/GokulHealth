export type Role = 'customer' | 'employee' | 'admin';

export interface Profile {
  id: string;
  phone_number: string;
  mpin_hash: string;
  role: Role;
  name: string | null;
  address: string | null;
  created_at: string;
}

export interface CustomerDetails {
  id: string;
  medical_issues: string | null;
  device_support: string | null;
}

export type ShiftPreference = 'morning' | 'evening';
export type KYCStatus = 'pending' | 'verified' | 'rejected';

export interface EmployeeDetails {
  id: string;
  experience: string;
  shift_preference: ShiftPreference;
  kyc_status: KYCStatus;
  kyc_document_details: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'unassigned' | 'assigned' | 'completed';

export interface Order {
  id: string;
  customer_id: string;
  employee_id: string | null;
  service_device_type: string;
  duration_months: number;
  locked_price: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  target_role: 'all' | 'customer' | 'employee' | 'admin' | string;
  target_user_id: string | null;
  title: string;
  body: string;
  read_by: string[];
  created_at: string;
}
