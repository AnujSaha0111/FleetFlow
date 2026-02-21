# FleetFlow 🚛

> **A Modern Fleet & Logistics Management System Prototype**

FleetFlow is a comprehensive, modular fleet and logistics management system built with cutting-edge web technologies. This prototype demonstrates end-to-end fleet operations management with role-based access control, real-time data synchronization, and intelligent business logic.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![Material-UI](https://img.shields.io/badge/Material--UI-7.3-007FFF?logo=mui)
![Firebase](https://img.shields.io/badge/Firebase-12.9-FFCA28?logo=firebase)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features Implemented](#-features-implemented)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Known Limitations](#-known-limitations)
- [Future Roadmap](#-future-roadmap)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About the Project

**FleetFlow** is a **prototype** fleet management system designed to showcase modern web development practices and demonstrate how to build a complete CRUD application with role-based access control, business logic validation, and real-time data management.

### **What Makes FleetFlow Special?**

✅ **Business Logic Driven**: Cargo capacity validation, license expiry checks, automated status workflows  
✅ **Role-Based Access**: Manager and Dispatcher roles with different permissions  
✅ **Real-Time Sync**: Redux Toolkit state management with Supabase backend  
✅ **Production Ready**: TypeScript for type safety, Material-UI for consistent design  
✅ **Comprehensive Analytics**: Financial metrics, operational KPIs, fleet utilization insights

---

## ✨ Features Implemented

### 🔐 **1. Authentication & Authorization**

- Firebase Authentication (Email/Password)
- Role-based access control (Manager / Dispatcher)
- Protected routes with automatic redirects
- Session persistence across page refreshes
- User role storage in Firestore

### 📊 **2. Command Center Dashboard**

- **Real-time KPI Cards**:
  - Active fleet count with availability breakdown
  - Maintenance alerts for overdue services
  - Fleet utilization rate percentage
  - Active trips in progress
- **Driver Status Overview**: Total drivers, available drivers with visual stats
- **Vehicle Overview**: Available, in-trip, in-shop, breakdown status counts
- **Financial Summary**: Revenue, expenses, and net profit calculations
- **Maintenance Alerts**: Overdue maintenance notifications with vehicle details

### 🚗 **3. Vehicle Registry**

- Complete CRUD operations (Create, Read, Update, Delete)
- Vehicle details: Registration, make, model, year, capacity, fuel type
- Real-time status tracking: `available`, `in-trip`, `in-shop`, `breakdown`
- Odometer management with automatic updates from fuel logs
- Status badges with color-coded indicators
- Delete confirmation dialogs for data safety

### 👨‍✈️ **4. Driver Profiles**

- Driver management with contact information
- License number and expiry date tracking
- **Automatic license expiry alerts** with visual badges
- Duty status management: `on-duty`, `off-duty`, `on-trip`
- Safety score tracking (0-100)
- Automatic status updates based on trip assignments

### 🚚 **5. Trip Dispatcher**

- Trip planning and assignment interface
- **Intelligent Business Logic**:
  - ✅ Cargo weight validation (must be ≤ vehicle capacity)
  - ✅ Expired license check (prevents assignment to drivers with expired licenses)
  - ✅ Vehicle availability check
- Trip status workflow: `scheduled` → `in-progress` → `completed` / `cancelled`
- Revenue tracking per trip
- Route management (origin, destination, distance)
- Departure and arrival time tracking
- **Auto-update vehicle and driver statuses** when trips start/complete

### 🔧 **6. Maintenance Logs**

- Maintenance record tracking and management
- Service types: Oil Change, Tire Rotation, Inspection, Repair, Other
- Status workflow: `scheduled` → `in-progress` → `completed`
- **Smart Status Updates**:
  - Start maintenance → Vehicle status changes to `in-shop`
  - Complete maintenance → Vehicle status returns to `available`
- Cost tracking per maintenance record
- Scheduled date management with overdue alerts
- Vehicle-specific maintenance history

### ⛽ **7. Fuel & Expenses**

- **Dual-Tab Interface**:

  **Fuel Logs Tab**:
  - Date, vehicle, quantity (liters), cost per liter tracking
  - **Auto-calculated total cost** (quantity × cost per liter)
  - **Automatic odometer updates** for vehicles
  - Fuel efficiency tracking (km/L)

  **Expenses Tab**:
  - Category-based expense tracking (Fuel, Maintenance, Insurance, Toll, Parking, Other)
  - Vehicle-specific or general fleet expenses
  - Date and amount tracking
  - Category filter for easy reporting

### 📈 **8. Operational Analytics** (Manager Only)

- **Role-Based Access**: Only managers can view analytics dashboard
- **Comprehensive Metrics**:
  - Fleet overview (vehicles, drivers, trips, maintenance records)
  - **Financial metrics**: Total revenue, expenses, profit, profit margin
  - **Operational metrics**: Average trip distance, cost per km, fuel efficiency
- **Visual Insights**:
  - Vehicle utilization breakdown by status (%)
  - Top 5 fuel-efficient vehicles (km/L)
  - Top performing vehicles by trip count
  - Maintenance status distribution
  - Cost per km analysis by vehicle
  - Expense breakdown by category
- **Consistent Calculations**: Financial numbers match Dashboard exactly

### 🎨 **UI/UX Features**

- Responsive design (mobile, tablet, desktop)
- Collapsible sidebar navigation
- Loading states with skeletons and spinners
- Success/error toast notifications
- Confirmation dialogs for destructive actions
- Form validation with helpful error messages
- Empty states with actionable CTAs
- Smooth scrolling and animations
- Custom gradient theme with Inter font

---

## 🛠️ Tech Stack

### **Frontend**

- **React 19.2** - UI library with latest features
- **TypeScript 5.5** - Type safety and developer experience
- **Vite 7.3** - Next-generation build tool and dev server
- **Material-UI v7.3.8** - Comprehensive component library
- **@mui/x-date-pickers** - Advanced date/time picker components
- **React Router v6** - Client-side routing with protected routes

### **State Management**

- **Redux Toolkit 2.11** - Efficient state management
- **React Redux 9.2** - React bindings for Redux
- **7 Redux Slices**: auth, vehicles, drivers, trips, maintenance, fuelLogs, expenses

### **Backend Services**

- **Firebase Authentication** - Email/password authentication
- **Firebase Firestore** - User role storage
- **Supabase PostgreSQL** - Primary database with 6 tables

### **Utilities**

- **date-fns** - Modern date manipulation library
- **Emotion** - CSS-in-JS styling

### **Database Schema**

```sql
-- 6 Tables with foreign key relationships and cascade deletes

vehicles (id, registration_number, make, model, year, capacity, fuel_type, status, odometer)
drivers (id, name, license_number, phone, license_expiry, duty_status, safety_score)
trips (id, vehicle_id, driver_id, origin, destination, cargo_weight, status, revenue, distance)
maintenance (id, vehicle_id, service_type, description, cost, scheduled_date, status)
fuel_logs (id, vehicle_id, date, quantity, cost_per_liter, total_cost, odometer_reading)
expenses (id, vehicle_id, category, description, amount, date)
```

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- Firebase account ([firebase.google.com](https://firebase.google.com))
- Supabase account ([supabase.com](https://supabase.com))

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/fleetflow.git
   cd FleetFlow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Email/Password authentication
   - Create Firestore database
   - Copy your Firebase config

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database schema (see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md))
   - Copy your Supabase URL and anon key

5. **Configure environment variables**

   Create `.env` file in the root directory:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. **Create your first user**
   - Go to Firebase Console → Authentication → Users
   - Add a user with email and password
   - Go to Firestore → Create collection `users`
   - Create document with ID = User's UID
   - Add field: `role` = `"manager"` or `"dispatcher"`

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. **Open the application**
   - Navigate to `http://localhost:5173`
   - Sign in with your created credentials
   - Start managing your fleet!

### **Build for Production**

```bash
npm run build
npm run preview  # Preview production build locally
```

---

## 📁 Project Structure

```
fleetflow/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx       # Route protection with RBAC
│   │   └── layout/
│   │       └── MainLayout.tsx           # Main layout with sidebar & header
│   ├── pages/
│   │   ├── Login.tsx                    # Authentication page
│   │   ├── Dashboard.tsx                # Command center with KPIs
│   │   ├── VehicleRegistry.tsx          # Vehicle CRUD operations
│   │   ├── DriverProfiles.tsx           # Driver management
│   │   ├── TripDispatcher.tsx           # Trip planning & assignment
│   │   ├── MaintenanceLogs.tsx          # Maintenance tracking
│   │   ├── FuelExpenses.tsx             # Fuel & expense management
│   │   └── Analytics.tsx                # Analytics dashboard (manager-only)
│   ├── store/
│   │   ├── index.ts                     # Redux store configuration
│   │   └── slices/
│   │       ├── authSlice.ts             # Authentication state
│   │       ├── vehiclesSlice.ts         # Vehicle state & thunks
│   │       ├── driversSlice.ts          # Driver state & thunks
│   │       ├── tripsSlice.ts            # Trip state & thunks
│   │       ├── maintenanceSlice.ts      # Maintenance state & thunks
│   │       ├── fuelLogsSlice.ts         # Fuel logs state & thunks
│   │       └── expensesSlice.ts         # Expenses state & thunks
│   ├── services/
│   │   ├── firebase.ts                  # Firebase config & initialization
│   │   └── supabase.ts                  # Supabase client setup
│   ├── utils/
│   │   ├── calculations.ts              # Dashboard KPI calculations
│   │   └── analytics.ts                 # Analytics metrics calculations
│   ├── types/
│   │   └── index.ts                     # TypeScript type definitions
│   ├── App.tsx                          # Root component with routing
│   ├── main.tsx                         # Application entry point
│   └── index.css                        # Global styles
├── .env.local                           # Environment variables (not committed)
├── .env.example                         # Environment variables template
├── .gitignore                           # Git ignore rules
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite build configuration
├── README.md                            # This file
└── DEPLOYMENT_GUIDE.md                  # Comprehensive deployment guide
```

---

## ⚠️ Known Limitations

> **Note**: This is a **prototype** built to demonstrate functionality and architecture. The following limitations exist:

### **1. No Multi-Tenancy (Single Organization)**

**Current Behavior**: All authenticated users (managers and dispatchers) share the same data pool. Anyone can view, edit, or delete data created by other users.

**Impact**:

- ❌ A manager from Company A can see and modify vehicles/trips/drivers from Company B
- ❌ No data isolation between different organizations
- ❌ No user-specific data ownership tracking
- ❌ Any authenticated user can delete records created by others

**Why This Matters**: In a production fleet management system, each company/organization should only see their own fleet data.

**Future Fix**: Implement organization-based multi-tenancy:

- Add `organization_id` column to all database tables
- Filter all queries by current user's organization
- Implement organization admin role for user management
- Add organization registration and invitation system

### **2. Limited Role Granularity**

**Current**: Only two roles (Manager & Dispatcher) with basic permission differences

- Managers: Full access including Analytics
- Dispatchers: All operational features except Analytics

**Future Enhancement**: Implement fine-grained permissions (e.g., can_delete, can_edit_expenses, can_view_financials)

### **3. No Audit Trail**

**Current**: No tracking of who created, modified, or deleted records

**Future Fix**: Add `created_by`, `updated_by`, `deleted_by` fields with timestamp tracking

### **4. No Real-Time Collaboration**

**Current**: Changes by one user don't automatically reflect for others until page refresh

**Future Fix**: Implement Supabase real-time subscriptions for live data updates

### **5. Basic Search & Filtering**

**Current**: Limited search capabilities, no advanced filters

**Future Fix**: Add full-text search, date range filters, multi-column sorting, saved filters

---

## 🗺️ Future Roadmap

### **Phase 1: Production Hardening** (Essential for Real-World Use)

#### 🏢 Multi-Tenancy & Data Isolation

- [ ] Add organization/company entity
- [ ] Organization registration and onboarding flow
- [ ] User invitation system with email verification
- [ ] Organization-scoped data access (RLS policies)
- [ ] Organization admin dashboard for user management

#### 🔒 Enhanced Security

- [ ] Row Level Security (RLS) policies on Supabase
- [ ] API rate limiting
- [ ] Input sanitization and validation
- [ ] Audit logging (who did what, when)
- [ ] Two-factor authentication (2FA)
- [ ] Session timeout and security policies

#### 👥 Advanced User Management

- [ ] User profiles with avatars
- [ ] Password reset flow
- [ ] Email verification
- [ ] Fine-grained role-based permissions
- [ ] User activity logs

---

### **Phase 2: Enhanced Features** (Nice to Have)

#### 📊 Advanced Analytics & Reporting

- [ ] **Interactive Charts**: Recharts/Chart.js integration
  - Revenue trends over time (line charts)
  - Expense breakdown (pie charts)
  - Fleet utilization timeline (bar charts)
- [ ] **Export Capabilities**: PDF, Excel, CSV exports
- [ ] **Custom Date Ranges**: Compare periods, YoY analysis
- [ ] **Scheduled Reports**: Email weekly/monthly summaries
- [ ] **Predictive Analytics**: Maintenance predictions, fuel trend forecasting

#### 🔔 Notifications & Alerts

- [ ] **Email Notifications**:
  - Maintenance due reminders
  - License expiry alerts (7 days, 1 day before)
  - Trip completion confirmations
- [ ] **Push Notifications**: Browser notifications for critical alerts
- [ ] **SMS Integration**: Twilio for driver notifications
- [ ] **In-App Notification Center**: Bell icon with notification history

#### 🗺️ GPS & Route Optimization

- [ ] **Real-Time GPS Tracking**: Integrate Google Maps/Mapbox
- [ ] **Route Visualization**: Display trip routes on map
- [ ] **Route Optimization**: Suggest optimal routes (Google Directions API)
- [ ] **Geofencing**: Alerts when vehicles enter/exit zones
- [ ] **Live Location Sharing**: For dispatchers to track active trips

#### 📱 Mobile Applications

- [ ] **React Native Mobile App**:
  - Driver app for trip updates
  - Photo uploads (delivery proof, damage reports)
  - Digital signatures for deliveries
  - Offline mode with sync
- [ ] **Progressive Web App (PWA)**: Offline-capable web app

#### 🤖 Automation & Integrations

- [ ] **Scheduled Tasks**:
  - Auto-create recurring maintenance
  - Auto-send license expiry reminders
- [ ] **Third-Party Integrations**:
  - Accounting software (QuickBooks, Xero)
  - Fuel card APIs for automatic fuel log import
  - Vehicle telematics systems
- [ ] **Webhooks**: External system notifications

---

### **Phase 3: Advanced Capabilities** (Long-Term Vision)

#### 🧠 Intelligent Features

- [ ] **Predictive Maintenance**: ML models to predict when maintenance is due
- [ ] **Fuel Price Optimization**: Suggest cheapest nearby fuel stations
- [ ] **Driver Performance Scoring**: AI-based scoring from trip data
- [ ] **Load Optimization**: Suggest optimal cargo distribution
- [ ] **Demand Forecasting**: Predict future trip volumes

#### 🌍 Enterprise Features

- [ ] **Multi-Location Support**: Manage fleets across cities/regions
- [ ] **Hierarchical Organizations**: Parent-child company relationships
- [ ] **White-Label Solution**: Rebrandable for different companies
- [ ] **API for Third Parties**: RESTful API with authentication
- [ ] **SSO Integration**: SAML, OAuth for enterprise authentication

#### 🎨 User Experience Enhancements

- [ ] **Dark Mode**: System-wide dark theme
- [ ] **Multi-Language Support**: i18n for global users
- [ ] **Accessibility (A11y)**: WCAG 2.1 AA compliance
- [ ] **Customizable Dashboards**: Drag-and-drop widget arrangement
- [ ] **Saved Views**: Custom filters and column arrangements

#### ⚡ Performance & Scaling

- [ ] **Database Optimization**: Indexes, query optimization
- [ ] **Caching Layer**: Redis for frequently accessed data
- [ ] **CDN Integration**: Cloudflare for static assets
- [ ] **Load Balancing**: Multi-instance deployment
- [ ] **Infinite Scroll/Pagination**: For large datasets
- [ ] **Background Jobs**: Queue system for heavy operations

---

## 🧪 Testing

Run the application in development mode and test:

1. **Authentication Flow**: Login, logout, session persistence
2. **CRUD Operations**: Create, read, update, delete on all modules
3. **Business Logic**: Cargo validation, license checks, status workflows
4. **Role-Based Access**: Analytics visible only to managers
5. **Responsive Design**: Test on mobile, tablet, desktop
6. **Data Consistency**: Verify Dashboard and Analytics show same numbers

---

## 🤝 Contributing

This is a prototype project. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Coding Standards**

- Use TypeScript for all new code
- Follow existing code style and structure
- Add comments for complex business logic
- Update documentation as needed
- Test your changes thoroughly

---

## 🐛 Bug Reports

If you find a bug, please open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/environment details

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License - Copyright (c) 2026 FleetFlow

```

---

## 🙏 Acknowledgments

- **Material-UI Team** for the comprehensive component library
- **Firebase Team** for authentication and Firestore services
- **Supabase Team** for the amazing PostgreSQL platform
- **React & TypeScript Communities** for excellent documentation and support
- **Vite Team** for the blazing fast build tool

---

## 📞 Contact & Support

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/fleetflow/issues)
- **Email**: anujsahabest0111@gmail.com (if applicable)

---

## ⭐ Star This Repository

If you find this project useful, please consider giving it a star! ⭐

It helps others discover this project and motivates further development.

---

<div align="center">

**Built with ❤️ for efficient fleet management**

</div>