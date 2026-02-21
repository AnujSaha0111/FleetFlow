-- FleetFlow Database Schema for Supabase
-- Run this script in your Supabase SQL Editor to create all tables

-- ====================================
-- 1. VEHICLES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  "licensePlate" VARCHAR(50) NOT NULL UNIQUE,
  "maxLoadCapacity" INTEGER NOT NULL, -- in kg
  "currentOdometer" INTEGER NOT NULL DEFAULT 0, -- in km
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  "acquisitionCost" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('available', 'on-trip', 'in-shop'))
);

-- ====================================
-- 2. DRIVERS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  "licenseNumber" VARCHAR(100) NOT NULL UNIQUE,
  "licenseExpiry" DATE NOT NULL,
  "safetyScore" INTEGER NOT NULL DEFAULT 100,
  "dutyStatus" VARCHAR(20) NOT NULL DEFAULT 'available',
  phone VARCHAR(50),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_duty_status CHECK ("dutyStatus" IN ('available', 'on-trip', 'off-duty')),
  CONSTRAINT valid_safety_score CHECK ("safetyScore" BETWEEN 0 AND 100)
);

-- ====================================
-- 3. TRIPS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vehicleId" UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  "driverId" UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  "cargoWeight" INTEGER NOT NULL, -- in kg
  "cargoDescription" TEXT,
  "departureDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "estimatedArrival" TIMESTAMP WITH TIME ZONE NOT NULL,
  "actualArrival" TIMESTAMP WITH TIME ZONE,
  "startOdometer" INTEGER NOT NULL,
  "endOdometer" INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  revenue DECIMAL(10, 2),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_trip_status CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- ====================================
-- 4. MAINTENANCE TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vehicleId" UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  "completedDate" DATE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_maintenance_type CHECK (type IN ('preventive', 'repair', 'inspection', 'other')),
  CONSTRAINT valid_maintenance_status CHECK (status IN ('pending', 'in-progress', 'completed'))
);

-- ====================================
-- 5. FUEL LOGS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vehicleId" UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  liters DECIMAL(10, 2) NOT NULL,
  "costPerLiter" DECIMAL(10, 2) NOT NULL,
  "totalCost" DECIMAL(10, 2) NOT NULL,
  odometer INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 6. EXPENSES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vehicleId" UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_expense_category CHECK (category IN ('fuel', 'maintenance', 'insurance', 'toll', 'parking', 'other'))
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_duty_status ON drivers("dutyStatus");
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips("vehicleId");
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips("driverId");
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance("vehicleId");
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle ON fuel_logs("vehicleId");
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses("vehicleId");

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================
-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all authenticated users for now)
-- You can customize these later based on Firebase user roles

CREATE POLICY "Allow all for authenticated users" ON vehicles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON drivers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON trips
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON maintenance
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON fuel_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON expenses
  FOR ALL USING (auth.role() = 'authenticated');

-- ====================================
-- SAMPLE DATA (Optional - for testing)
-- ====================================
-- Uncomment to add sample data

/*
-- Sample Vehicles
INSERT INTO vehicles (name, model, "licensePlate", "maxLoadCapacity", "currentOdometer", status, "acquisitionCost") VALUES
('Truck Alpha', 'Ford F-150', 'ABC-1234', 1000, 45000, 'available', 35000),
('Truck Beta', 'Chevrolet Silverado', 'XYZ-5678', 1200, 32000, 'available', 42000),
('Van Gamma', 'Mercedes Sprinter', 'DEF-9012', 800, 28000, 'on-trip', 38000);

-- Sample Drivers
INSERT INTO drivers (name, "licenseNumber", "licenseExpiry", "safetyScore", "dutyStatus", phone) VALUES
('John Smith', 'DL-123456', '2027-12-31', 95, 'available', '+1-555-0101'),
('Jane Doe', 'DL-789012', '2026-08-15', 88, 'on-trip', '+1-555-0102'),
('Mike Johnson', 'DL-345678', '2028-03-20', 92, 'available', '+1-555-0103');

-- Sample Maintenance Records
INSERT INTO maintenance ("vehicleId", date, type, description, cost, status) 
SELECT id, CURRENT_DATE - INTERVAL '5 days', 'preventive', 'Oil change and filter replacement', 150.00, 'pending'
FROM vehicles LIMIT 1;
*/

ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS notes TEXT;
-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles';

ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance DISABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
