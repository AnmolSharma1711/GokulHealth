import { Profile, CustomerDetails, EmployeeDetails, Order } from '../types/database';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export class RealDatabase {
  
  // --- Auth & Profiles ---
  async login(phone: string, mpin: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone_number', phone)
      .eq('mpin_hash', mpin)
      .single();
      
    if (error) return null;
    return data as Profile;
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return null;
    return data as Profile;
  }

  async registerProfile(profile: Profile): Promise<void> {
    const { error } = await supabase.from('profiles').insert([profile]);
    if (error) throw new Error(error.message);
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
  }

  // --- Customer ---
  async getCustomerDetails(id: string): Promise<CustomerDetails | null> {
    const { data, error } = await supabase.from('customer_details').select('*').eq('id', id).single();
    if (error) return null;
    return data as CustomerDetails;
  }

  async saveCustomerDetails(details: CustomerDetails): Promise<void> {
    const { error } = await supabase.from('customer_details').upsert([details]);
    if (error) throw new Error(error.message);
  }

  // --- Employee ---
  async getEmployeeDetails(id: string): Promise<EmployeeDetails | null> {
    const { data, error } = await supabase.from('employee_details').select('*').eq('id', id).single();
    if (error) return null;
    return data as EmployeeDetails;
  }

  async saveEmployeeDetails(details: EmployeeDetails): Promise<void> {
    const { error } = await supabase.from('employee_details').upsert([details]);
    if (error) throw new Error(error.message);
  }

  // --- Orders ---
  async createOrder(order: Order): Promise<void> {
    // We don't insert the generated uuid if Supabase generates it. 
    // But since our types expect an ID, we'll let supabase handle or pass ours.
    const { error } = await supabase.from('orders').insert([order]);
    if (error) throw new Error(error.message);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*').eq('customer_id', customerId);
    if (error) throw new Error(error.message);
    return data as Order[];
  }

  async getOrdersByEmployee(employeeId: string): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*').eq('employee_id', employeeId);
    if (error) throw new Error(error.message);
    return data as Order[];
  }

  async getUnassignedOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*').eq('order_status', 'unassigned');
    if (error) throw new Error(error.message);
    return data as Order[];
  }

  async assignOrder(orderId: string, employeeId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ employee_id: employeeId, order_status: 'assigned' })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
  }

  async updatePaymentStatus(orderId: string, status: Order['payment_status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
  }

  // --- Admin ---
  async getVerifiedEmployees(): Promise<(Profile & EmployeeDetails)[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, employee_details!inner(*)')
      .eq('employee_details.kyc_status', 'verified');
      
    if (error) return [];
    // Flatten the joined data
    return data.map((d: any) => ({
      ...d,
      ...d.employee_details
    }));
  }

  async getPendingEmployees(): Promise<(Profile & EmployeeDetails)[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, employee_details!inner(*)')
      .eq('employee_details.kyc_status', 'pending');
      
    if (error) return [];
    return data.map((d: any) => ({
      ...d,
      ...d.employee_details
    }));
  }
  // --- Notifications ---
  async createNotification(title: string, body: string, targetRole: string, targetUserId: string | null = null): Promise<void> {
    const { error } = await supabase.from('notifications').insert([{
      title, body, target_role: targetRole, target_user_id: targetUserId
    }]);
    if (error) console.error("Notification Error:", error.message);
  }

  async getNotificationsForUser(userId: string, role: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_role.eq.all,target_role.eq.${role},target_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    // Fetch current read_by array
    const { data } = await supabase.from('notifications').select('read_by').eq('id', notificationId).single();
    if (data) {
      const readBy = data.read_by || [];
      if (!readBy.includes(userId)) {
        await supabase.from('notifications').update({ read_by: [...readBy, userId] }).eq('id', notificationId);
      }
    }
  }

  // --- Orders ---
  async markOrderCompleted(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'completed' })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
  }
  // --- Push Tokens ---
  async savePushToken(userId: string, token: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);
    if (error) console.error("Error saving push token:", error.message);
  }
}

export const db = new RealDatabase();
