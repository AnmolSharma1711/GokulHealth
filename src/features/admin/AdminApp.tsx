import React, { useState, useEffect } from 'react';
import { Shield, Users, Inbox, Bell, LayoutDashboard, LogOut, Database, Trash2 } from 'lucide-react';
import { db } from '../../store/MockDatabase';
import { Order, Profile, EmployeeDetails } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { AdminAuth } from './AdminAuth';
import { useNavigate } from 'react-router-dom';
import { ProfileEditor } from '../../components/common/ProfileEditor';

type Tab = 'overview' | 'matching' | 'employees' | 'notifications' | 'system_admins' | 'database' | 'profile';

export function AdminApp() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('matching');
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [verifiedEmployees, setVerifiedEmployees] = useState<(Profile & EmployeeDetails)[]>([]);
  const [pendingEmployees, setPendingEmployees] = useState<(Profile & EmployeeDetails)[]>([]);
  const [adminUsers, setAdminUsers] = useState<Profile[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<Profile | null>(null);
  
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  
  // Notification State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTarget, setNotifTarget] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const fetchData = async () => {
    if (!user) return;
    const orders = await db.getUnassignedOrders();
    const verified = await db.getVerifiedEmployees();
    const pending = await db.getPendingEmployees();
    const admins = await db.getAdmins();
    const users = await db.getAllUsers();
    const allOrds = await db.getAllOrders();
    
    setUnassignedOrders(orders);
    setVerifiedEmployees(verified);
    setPendingEmployees(pending);
    setAdminUsers(admins);
    setAllUsers(users);
    setAllOrders(allOrds);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return <AdminAuth onLogin={login} />;
  }

  const handleAssign = async (orderId: string, employeeId: string) => {
    const orderToAssign = unassignedOrders.find(o => o.id === orderId);
    if (!orderToAssign) return;

    await db.assignOrder(orderId, employeeId);
    
    // Notify Customer
    await db.createNotification(
      "Service Assigned \uD83D\uDE90",
      `Your request for ${orderToAssign.service_device_type} has been assigned to a verified professional.`,
      'customer',
      orderToAssign.customer_id
    );

    // Notify Employee
    await db.createNotification(
      "New Job Assigned \uD83D\uDCE6",
      `You have been assigned a new job for ${orderToAssign.service_device_type}. Check your Active Jobs tab!`,
      'employee',
      employeeId
    );

    alert('Employee assigned successfully! System notifications dispatched.');
    fetchData();
  };

  const handleVerifyKyc = async (employeeId: string, status: 'verified' | 'rejected') => {
    const existing = await db.getEmployeeDetails(employeeId);
    if (existing) {
      await db.saveEmployeeDetails({ ...existing, kyc_status: status });
    }
    fetchData();
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    
    await db.createNotification(notifTitle, notifBody, notifTarget);
    alert(`Notification broadcasted successfully!`);
    setNotifTitle('');
    setNotifBody('');
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) return;
    const user = await db.searchUserByPhone(searchPhone);
    
    if (!user) {
      alert('User not found with this phone number.');
      setSearchResult(null);
      return;
    }

    if (user.role === 'customer') {
      alert('Customers cannot be promoted to Admin. Please search for an Employee.');
      setSearchResult(null);
      return;
    }

    setSearchResult(user);
  };

  const handleMakeAdmin = async (userId: string) => {
    if (window.confirm('Are you sure you want to grant Admin privileges to this user?')) {
      await db.updateUserRole(userId, 'admin');
      alert('User successfully promoted to Admin!');
      setSearchResult(null);
      setSearchPhone('');
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 dark:bg-transparent flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-400" />
          <h1 className="text-lg font-bold">Admin Console</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-indigo-800 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform fixed md:sticky top-0 left-0 h-screen w-64 bg-indigo-900 text-white flex flex-col z-30`}>
        <div className="p-6 border-b border-indigo-800 hidden md:block">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Analytics Overview</span>
          </button>
          <button
            onClick={() => { setActiveTab('matching'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'matching' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Inbox className="w-5 h-5" />
            <span className="font-medium">Order Routing</span>
          </button>
          <button
            onClick={() => { setActiveTab('employees'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'employees' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Employee Mgmt</span>
          </button>
          <button
            onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Global Notifications</span>
          </button>
          <button
            onClick={() => { setActiveTab('system_admins'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'system_admins' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">System Admins</span>
          </button>
          <button
            onClick={() => { setActiveTab('database'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'database' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">Database DB</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-indigo-800 space-y-2">
          <button
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-indigo-200 hover:bg-red-500/20 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <ProfileEditor profile={user} />
          </div>
        )}
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dashboard Analytics</h2>
            <div className="grid grid-cols-3 gap-6">
              <Card className="glass-card dark:glass-dark border-l-4 border-indigo-500">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 dark:text-white">Unassigned Orders</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{unassignedOrders.length}</p>
                </CardContent>
              </Card>
              <Card className="glass-card dark:glass-dark border-l-4 border-emerald-500">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 dark:text-white">Verified Employees</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{verifiedEmployees.length}</p>
                </CardContent>
              </Card>
              <Card className="glass-card dark:glass-dark border-l-4 border-amber-500">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 dark:text-white">Pending KYC</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{pendingEmployees.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ORDER MATCHING TAB */}
        {activeTab === 'matching' && (
          <div className="flex flex-col min-h-[calc(100vh-8rem)]">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 shrink-0">Employee-Order Matching</h2>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
              
              {/* Unassigned Orders Panel */}
              <div className="flex flex-col bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden h-[500px] lg:h-full">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/30 bg-slate-50 dark:bg-slate-900/50">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    Unassigned Orders
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white px-2.5 py-0.5 rounded-full text-xs">{unassignedOrders.length}</span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {unassignedOrders.length === 0 ? (
                    <div className="text-center text-slate-500 dark:text-white mt-10">No pending orders to assign.</div>
                  ) : (
                    unassignedOrders.map((order) => (
                      <div key={order.id} className="border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">{order.service_device_type}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-md ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.payment_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-white mb-4 bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/30">
                          <div><span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Shift</span><br />{order.time_each_day || 'Not specified'}</div>
                          <div><span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Patient Age</span><br />{order.patient_age || 'N/A'}</div>
                          <div><span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Start</span><br />{order.start_date || 'N/A'}</div>
                          <div><span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">End</span><br />{order.end_date || 'N/A'}</div>
                          {order.service_details && (
                            <div className="col-span-2 mt-1 pt-2 border-t border-slate-100 dark:border-slate-700/30">
                              <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Details</span><br />
                              <span className="italic text-xs">{order.service_details}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/30">
                          <p className="text-xs font-medium text-slate-500 dark:text-white mb-2">Available Employees to Assign:</p>
                          <div className="space-y-2 flex flex-col">
                            {verifiedEmployees.length === 0 ? (
                              <span className="text-xs text-red-500">No verified employees available!</span>
                            ) : (
                              verifiedEmployees.map(emp => {
                                const isBusy = allOrders.some(o => o.employee_id === emp.id && o.order_status === 'assigned');
                                return (
                                  <div key={emp.id} className={`flex justify-between items-center p-2 rounded-lg border ${isBusy ? 'bg-red-50 border-red-100 opacity-75' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/30'}`}>
                                    <div>
                                      <span className="text-sm font-medium text-slate-900 dark:text-white block flex items-center gap-2">
                                        {emp.name} {isBusy && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Busy</span>}
                                      </span>
                                      <span className="text-xs text-emerald-600 dark:text-white font-medium capitalize">{emp.shift_preference} Shift</span>
                                    </div>
                                    <Button size="sm" onClick={() => handleAssign(order.id, emp.id)} disabled={isBusy} className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs disabled:opacity-50">
                                      Assign
                                    </Button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Available Employees Panel */}
              <div className="flex flex-col bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden h-[500px] lg:h-full">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/30 bg-slate-50 dark:bg-slate-900/50">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    Available Verified Employees
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs">{verifiedEmployees.length}</span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid gap-4 grid-cols-1 xl:grid-cols-2 content-start">
                  {verifiedEmployees.map(emp => {
                    const isBusy = allOrders.some(o => o.employee_id === emp.id && o.order_status === 'assigned');
                    return (
                      <div key={emp.id} className={`border rounded-xl p-4 ${isBusy ? 'border-red-200 bg-red-50/30' : 'border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isBusy ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {emp.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{emp.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-white capitalize">{emp.shift_preference} Shift • {emp.experience}</p>
                          </div>
                        </div>
                        <div className={`text-xs font-medium bg-white dark:bg-slate-800/50 border rounded p-2 text-center ${isBusy ? 'text-red-600 border-red-200' : 'text-slate-500 dark:text-white border-slate-200 dark:border-slate-700/50'}`}>
                          Status: {isBusy ? 'On a Job' : 'Ready for Jobs'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </div>
          </div>
        )}

        {/* EMPLOYEE MANAGEMENT (KYC) */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">KYC Approvals</h2>
            {pendingEmployees.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-white bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                No pending KYC requests at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingEmployees.map(emp => (
                  <Card key={emp.id} className="border-amber-200">
                    <CardHeader className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-100 dark:border-amber-800/50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-amber-900 dark:text-amber-100">{emp.name}</CardTitle>
                        <span className="bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded font-bold">PENDING</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-white">Phone</p>
                        <p className="text-slate-900 dark:text-white">{emp.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-white">Experience</p>
                        <p className="text-slate-900 dark:text-white">{emp.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-white">KYC Document Reference</p>
                        <p className="text-slate-900 dark:text-white font-mono bg-slate-100 p-2 rounded mt-1">{emp.kyc_document_details}</p>
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/30">
                        <Button fullWidth className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleVerifyKyc(emp.id, 'verified')}>
                          Approve KYC
                        </Button>
                        <Button fullWidth variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleVerifyKyc(emp.id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Global Notification Center</h2>
            <Card>
              <CardHeader>
                <CardTitle>Compose Broadcast Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1.5">Target Audience</label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value)}
                    >
                      <option value="all">All Users (Customers & Employees)</option>
                      <option value="customer">All Customers</option>
                      <option value="employee">All Employees</option>
                      <option value="morning_shift">Employees (Morning Shift)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1.5">Notification Title</label>
                    <input
                      type="text"
                      className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. System Maintenance"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1.5">Message Body</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter the message content here..."
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" size="lg">
                    Send Push Notification
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SYSTEM ADMINS TAB */}
        {activeTab === 'system_admins' && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">System Administrators</h2>
            
            {/* Search & Add Admin */}
            <Card className="mb-8">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
                <CardTitle className="text-slate-900 dark:text-white">Promote User to Admin</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSearchUser} className="flex gap-4 items-end mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1.5">Search by Phone Number</label>
                    <input
                      type="tel"
                      className="flex h-11 w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 9876543210"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6">
                    Search User
                  </Button>
                </form>

                {searchResult && (
                  <div className="mt-6 p-4 border border-emerald-200 bg-emerald-50 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{searchResult.name || 'Unnamed User'}</h4>
                      <p className="text-sm text-emerald-700">Phone: {searchResult.phone_number}</p>
                      <p className="text-xs font-medium text-emerald-600 mt-1 uppercase tracking-wide">Current Role: {searchResult.role}</p>
                    </div>
                    {searchResult.role === 'customer' ? (
                      <span className="text-red-600 font-bold px-4 text-sm text-right">Cannot promote Customer</span>
                    ) : searchResult.role !== 'admin' ? (
                      <Button onClick={() => handleMakeAdmin(searchResult.id)} className="bg-emerald-600 hover:bg-emerald-700">
                        Make Admin
                      </Button>
                    ) : (
                      <span className="text-emerald-700 font-bold px-4">Already Admin</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* List Admins */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Current Admins</h3>
            <div className="grid gap-4">
              {adminUsers.map(admin => (
                <div key={admin.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl">
                    {admin.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{admin.name || 'Admin'}</h4>
                    <p className="text-sm text-slate-500 dark:text-white">{admin.phone_number}</p>
                  </div>
                  <Shield className="w-6 h-6 text-indigo-400 ml-auto" />
                </div>
              ))}
              {adminUsers.length === 0 && (
                <p className="text-slate-500 dark:text-white text-center py-8">No admins found.</p>
              )}
            </div>
          </div>
        )}

        {/* DATABASE TAB */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Database Management</h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Users Table */}
              <Card className="glass-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100/50 dark:border-slate-700/50 backdrop-blur-md">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    All Users
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-white bg-slate-50 dark:bg-slate-800 sticky top-0 uppercase">
                      <tr>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.phone_number}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'employee' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingUser(u)}
                              className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
                            >
                              Edit
                            </button>
                            {u.id !== user.id && (
                              <button 
                                onClick={async () => {
                                  if (window.confirm('Delete this user permanently?')) {
                                    await db.deleteUser(u.id);
                                    fetchData();
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Orders Table */}
              <Card className="glass-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100/50 dark:border-slate-700/50 backdrop-blur-md">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Inbox className="w-5 h-5" />
                    All Orders
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-white bg-slate-50 dark:bg-slate-800 sticky top-0 uppercase">
                      <tr>
                        <th className="px-4 py-3">Service</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.service_device_type}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${o.order_status === 'completed' ? 'bg-green-100 text-green-700' : o.order_status === 'assigned' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {o.order_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={async () => {
                                if (window.confirm('Delete this order permanently?')) {
                                  await db.deleteOrder(o.id);
                                  fetchData();
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

      </main>
      
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <ProfileEditor 
              profile={editingUser} 
              isAdminEdit={true}
              onCancel={() => setEditingUser(null)}
              onSave={() => {
                setEditingUser(null);
                fetchData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
