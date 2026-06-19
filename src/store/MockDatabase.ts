import { Profile, CustomerDetails, EmployeeDetails, Order, Service } from '../types/database';
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

  async getAdmins(): Promise<Profile[]> {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'admin');
    return (data as Profile[]) || [];
  }

  async searchUserByPhone(phone: string): Promise<Profile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('phone_number', phone).single();
    return (data as Profile) || null;
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    await supabase.from('profiles').update({ role }).eq('id', id);
  }

  async registerProfile(profile: Profile): Promise<void> {
    const { error } = await supabase.from('profiles').insert([profile]);
    if (error) throw new Error(error.message);
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  }

  // --- OTP Auth ---
  async sendPhoneOtp(phone: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`, // Assumes Indian phone number by default, customize as needed
    });
    if (error) throw new Error(error.message);
  }

  async verifyPhoneOtp(phone: string, token: string): Promise<any> {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    });
    if (error) throw new Error(error.message);
    return data;
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
      .eq('role', 'employee')
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

  async getAllUsers(): Promise<Profile[]> {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  async deleteUser(id: string): Promise<void> {
    await supabase.from('customer_details').delete().eq('id', id);
    await supabase.from('employee_details').delete().eq('id', id);
    await supabase.from('orders').delete().or(`customer_id.eq.${id},employee_id.eq.${id}`);
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async getAllOrders(): Promise<Order[]> {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteNotification(id: string): Promise<void> {
    await supabase.from('notifications').delete().eq('id', id);
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
      .or(`target_role.eq.all,and(target_user_id.is.null,target_role.eq.${role}),target_user_id.eq.${userId}`)
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

  async cancelOrder(orderId: string, customerId: string): Promise<void> {
    const { data } = await supabase.from('orders').select('employee_id, service_details').eq('id', orderId).single();
    const newDetails = `[CANCELLED] ${data?.service_details || ''}`;
    const { error } = await supabase
      .from('orders')
      .update({ 
        order_status: 'completed',
        service_details: newDetails
      })
      .eq('id', orderId)
      .eq('customer_id', customerId);
    if (error) throw new Error(error.message);
    if (data && data.employee_id) {
      await this.createNotification(
        "Appointment Cancelled",
        "The customer has cancelled their appointment. You are now available for new assignments.",
        "employee",
        data.employee_id
      );
    }
  }
  async reassignOrder(orderId: string, newEmployeeId: string): Promise<void> {
    const { data: order } = await supabase.from('orders').select('employee_id').eq('id', orderId).single();
    const oldEmployeeId = order?.employee_id;

    const { error } = await supabase
      .from('orders')
      .update({ employee_id: newEmployeeId, order_status: 'assigned' })
      .eq('id', orderId);
      
    if (error) throw new Error(error.message);

    // Notify new employee
    await this.createNotification(
      "Emergency Reassignment",
      "You have been assigned to an emergency appointment. Please check your dashboard for details.",
      "employee",
      newEmployeeId
    );

    // Notify old employee if they exist
    if (oldEmployeeId) {
      await this.createNotification(
        "Shift Reassigned",
        "An appointment assigned to you has been emergency-reassigned to another staff member. You are now available.",
        "employee",
        oldEmployeeId
      );
    }
  }

  // --- Services ---
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
    if (error) return [];
    return data as Service[];
  }

  async createService(service: Service): Promise<void> {
    const { error } = await supabase.from('services').insert([service]);
    if (error) throw new Error(error.message);
  }

  async updateService(id: string, updates: Partial<Service>): Promise<void> {
    const { error } = await supabase.from('services').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
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
