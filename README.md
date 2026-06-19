# Gokul Health - Booking Ecosystem

A comprehensive platform designed to seamlessly connect customers with professional healthcare providers for long-term and short-term home care services. The ecosystem consists of three interconnected portals: **Customer**, **Employee**, and **Admin**.

## Features

### 🌟 Customer Portal
- **Service Browsing:** Browse a catalog of medical and care services (e.g., Nursing, Babysitting, Caretaking).
- **Dynamic Pricing:** Lock in guaranteed prices dynamically calculated by day, hour, or month.
- **Easy Booking:** Select services, specify patient details, and book via an intuitive pop-up interface.
- **Payment Integration:** Secure checkout flow (mocked Razorpay integration).

### 💼 Employee Portal
- **Dashboard Overview:** View pending job requests, active assignments, and financial earnings.
- **KYC Verification:** Submit KYC details for administrative approval before taking jobs.
- **Job Management:** Accept or reject assigned caretaking requests.

### 🛡️ Admin Portal
- **Service Management:** Add, edit, and categorize the available healthcare services.
- **Dynamic Pricing Controls:** Set pricing structures (day, hour, month) for each service.
- **Order Tracking:** Monitor all active, pending, and completed bookings.
- **Employee Reassignment:** Instantly handle emergency reassignments if an employee cannot fulfill a booking.
- **User Management:** Verify employee KYC submissions and manage platform users.

### 🔐 Security & Auth
- **Multi-Step Authentication:** Secure MPIN-based login flow requiring phone number verification first.
- **Real-Time SMS OTP:** Password reset flow integrated with Supabase Auth (via Twilio) for real SMS delivery.
- **Role-Based Access Control:** Strict routing and authorization separating Customer, Employee, and Admin views.

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Mobile App Builder:** Capacitor (iOS & Android compilation)
- **Styling:** Tailwind CSS (with custom Glassmorphism and dark mode support)
- **Icons:** Lucide React
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AnmolSharma1711/GokulHealth.git
   cd GokulHealth
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Twilio SMS Configuration (Optional but Recommended):**
   To enable real-time SMS OTPs for MPIN recovery, link your Twilio Account SID and Auth Token inside your Supabase Dashboard under `Authentication -> Providers -> Phone`.

5. **Run the Web Development Server:**
   ```bash
   npm run dev
   ```

6. **Build for Mobile (Android & iOS):**
   This project uses **Capacitor** to wrap the web app into native mobile applications.
   ```bash
   npm run build
   npx cap sync
   ```
   To open the native IDEs:
   ```bash
   npx cap open android
   npx cap open ios
   ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
