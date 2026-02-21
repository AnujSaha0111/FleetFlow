// User & Authentication Types
export type UserRole = "manager" | "dispatcher";

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

// Vehicle Types
export type VehicleStatus = "available" | "on-trip" | "in-shop";

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  maxLoadCapacity: number; // in kg
  currentOdometer: number; // in km
  status: VehicleStatus;
  acquisitionCost: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Driver Types
export type DriverDutyStatus = "available" | "on-trip" | "off-duty";

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number; // 0-100
  dutyStatus: DriverDutyStatus;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Trip Types
export type TripStatus = "active" | "completed" | "cancelled";

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeight: number; // in kg
  cargoDescription: string;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  startOdometer: number;
  endOdometer?: number;
  status: TripStatus;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
}

// Maintenance Types
export type MaintenanceType = "preventive" | "repair" | "inspection" | "other";
export type MaintenanceStatus = "pending" | "in-progress" | "completed";

export interface Maintenance {
  id: string;
  vehicleId: string;
  date: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  status: MaintenanceStatus;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Expense & Fuel Types
export type ExpenseCategory =
  | "fuel"
  | "maintenance"
  | "insurance"
  | "toll"
  | "parking"
  | "other";

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  createdAt: string;
}

// Analytics Types
export interface VehicleAnalytics {
  vehicleId: string;
  fuelEfficiency: number; // km per liter
  totalRevenue: number;
  totalMaintenanceCost: number;
  totalFuelCost: number;
  roi: number; // percentage
  utilizationRate: number; // percentage
}

export interface DashboardKPIs {
  activeFleetCount: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
  totalRevenue: number;
  totalExpenses: number;
}
