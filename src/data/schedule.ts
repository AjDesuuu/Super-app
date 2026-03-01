// Bus Operator Mock Data - Real PITX Terminal Structure
// Based on actual PITX gates and bays from your document

export type TripStatus = 'scheduled' | 'arriving' | 'boarding' | 'departed' | 'cancelled' | 'delayed';
export type DelayReason = 'traffic' | 'breakdown' | 'weather' | 'passenger' | 'accident' | 'other';
export type BusStatus = 'active' | 'maintenance' | 'off-duty';

// ============================================================================
// TERMINALS (Real Metro Manila Bus Terminals)
// ============================================================================

export interface Terminal {
  id: number;
  name: string;
  area: string;
  coordinates: [number, number];
  gates: number[];
  total_bays: number;
}

export const terminals: Terminal[] = [
  {
    id: 1,
    name: "PITX (Parañaque Integrated Terminal Exchange)",
    area: "Parañaque City",
    coordinates: [14.4594, 121.0118],
    gates: [2, 4, 5], // Gate 2 (Batangas), Gate 4 (Bicol), Gate 5 (North Luzon)
    total_bays: 40
  },
  {
    id: 2,
    name: "Araneta City Bus Terminal",
    area: "Quezon City",
    coordinates: [14.6199, 121.0516],
    gates: [1, 2, 3],
    total_bays: 25
  },
  {
    id: 3,
    name: "Cubao Bus Terminal",
    area: "Quezon City",
    coordinates: [14.6191, 121.0515],
    gates: [1, 2, 3, 4],
    total_bays: 30
  },
  {
    id: 4,
    name: "Pasay Bus Terminal",
    area: "Pasay City",
    coordinates: [14.5378, 121.0014],
    gates: [1, 2],
    total_bays: 15
  },
];

// PITX Gate Configuration (Real structure from your document)
export const pitxGateConfig = {
  gate2: {
    name: "Gate 2 - Batangas & Nearby Provinces",
    bays: [8, 9, 10, 11, 12],
    destinations: ["Batangas City", "Lipa City", "Balibago", "San Jose", "Lucena City", "Sta. Cruz", "San Juan"]
  },
  gate4: {
    name: "Gate 4 - Bicol Region",
    bays: [16, 17, 18, 19, 20, 21, 22, 23],
    destinations: ["Tabaco City", "Legazpi City", "Naga City", "Sorsogon", "Daet", "Matnog", "Virac", "Bulan", "Caramoan", "Gubat", "Pilar", "Iriga", "Masbate City"]
  },
  gate5: {
    name: "Gate 5 - Northern Luzon",
    bays: [33, 34, 35, 36, 37],
    destinations: ["Olongapo City", "Baguio City", "Dagupan City", "San Carlos City", "Tuguegarao City", "San Jose Nueva Ecija"]
  }
};

// ============================================================================
// OPERATORS (Real Bus Companies from PITX Schedule)
// ============================================================================

export interface Operator {
  id: string;
  name: string;
  shortName: string;
  fleet_size: number;
  primary_gates: number[]; // Which gates they operate from
}

export const mockOperators: Operator[] = [
  // Gate 2 - Batangas operators
  { id: 'op-1', name: 'JAM/CHER Transport', shortName: 'JAM/CHER', fleet_size: 15, primary_gates: [2] },
  { id: 'op-2', name: 'ALPS The Bus Inc.', shortName: 'ALPS', fleet_size: 25, primary_gates: [2, 4] },
  { id: 'op-3', name: 'CERES-GOLDSTAR', shortName: 'CERES-GOLDSTAR', fleet_size: 18, primary_gates: [2] },
  { id: 'op-4', name: 'OM TRANS', shortName: 'OM TRANS', fleet_size: 12, primary_gates: [2] },
  { id: 'op-5', name: 'LLI Bus Co. Inc.', shortName: 'LLI BUS CO.', fleet_size: 14, primary_gates: [2] },
  { id: 'op-6', name: 'Barney Auto Lines', shortName: 'BARNEY AUTO', fleet_size: 10, primary_gates: [2] },
  { id: 'op-7', name: 'San Agustin', shortName: 'SAN AGUSTIN', fleet_size: 8, primary_gates: [2] },
  { id: 'op-8', name: 'RORO Bus', shortName: 'RORO BUS', fleet_size: 10, primary_gates: [2] },
  { id: 'op-9', name: 'AB Liner', shortName: 'AB LINER', fleet_size: 12, primary_gates: [2] },
  
  // Gate 4 - Bicol operators
  { id: 'op-10', name: 'DLTB Co.', shortName: 'DLTB.CO', fleet_size: 30, primary_gates: [4] },
  { id: 'op-11', name: 'Cagsawa Transport', shortName: 'CAGSAWA', fleet_size: 20, primary_gates: [4] },
  { id: 'op-12', name: 'Penafrancia Tours', shortName: 'PENAFRANCIA', fleet_size: 18, primary_gates: [4] },
  { id: 'op-13', name: 'Bicol Isarog Transport', shortName: 'BICOL ISAROG', fleet_size: 15, primary_gates: [4] },
  { id: 'op-14', name: 'Raymond Transportation', shortName: 'RAYMOND', fleet_size: 14, primary_gates: [4] },
  { id: 'op-15', name: 'Superlines Transportation', shortName: 'SUPERLINES', fleet_size: 16, primary_gates: [4] },
  { id: 'op-16', name: 'JVH Transport', shortName: 'JVH TRANSPORT', fleet_size: 10, primary_gates: [4] },
  { id: 'op-17', name: 'Elavil Transport', shortName: 'ELAVIL', fleet_size: 12, primary_gates: [4] },
  { id: 'op-18', name: 'Legaspi St. Jude', shortName: 'LEGASPI ST. JUDE', fleet_size: 14, primary_gates: [4] },
  
  // Gate 5 - Northern Luzon operators
  { id: 'op-19', name: 'Victory Liner Inc.', shortName: 'VICTORY LINER', fleet_size: 40, primary_gates: [5] },
  { id: 'op-20', name: 'Solid North Transit', shortName: 'SOLID NORTH', fleet_size: 35, primary_gates: [5] },
  { id: 'op-21', name: 'Baliwag Transit Inc.', shortName: 'BALIWAG', fleet_size: 25, primary_gates: [5] },
  { id: 'op-22', name: 'Saulog Transit Inc.', shortName: 'SAULOG', fleet_size: 20, primary_gates: [5] },
  { id: 'op-23', name: 'Florida Transport Inc.', shortName: 'FLORIDA TRANS', fleet_size: 18, primary_gates: [5] },
];

// ============================================================================
// ROUTES (Real Destinations from PITX)
// ============================================================================

export interface Route {
  id: string;
  destination: string;
  province: string;
  gate: number; // Which gate at PITX
  distance_km: number;
  avg_duration_mins: number;
  fare: number;
}

export const mockRoutes: Route[] = [
  // Gate 2 - Batangas & Nearby
  { id: 'route-1', destination: 'Batangas City', province: 'Batangas', gate: 2, distance_km: 110, avg_duration_mins: 150, fare: 180 },
  { id: 'route-2', destination: 'Lipa City', province: 'Batangas', gate: 2, distance_km: 85, avg_duration_mins: 120, fare: 150 },
  { id: 'route-3', destination: 'Balibago', province: 'Batangas', gate: 2, distance_km: 95, avg_duration_mins: 135, fare: 160 },
  { id: 'route-4', destination: 'San Jose', province: 'Occidental Mindoro', gate: 2, distance_km: 180, avg_duration_mins: 240, fare: 280 },
  { id: 'route-5', destination: 'Lucena City', province: 'Quezon', gate: 2, distance_km: 140, avg_duration_mins: 180, fare: 220 },
  { id: 'route-6', destination: 'Sta. Cruz', province: 'Laguna', gate: 2, distance_km: 95, avg_duration_mins: 130, fare: 160 },
  { id: 'route-7', destination: 'Nasugbu', province: 'Batangas', gate: 2, distance_km: 90, avg_duration_mins: 125, fare: 155 },
  { id: 'route-8', destination: 'Calauag', province: 'Quezon', gate: 2, distance_km: 200, avg_duration_mins: 270, fare: 320 },
  
  // Gate 4 - Bicol Region
  { id: 'route-9', destination: 'Tabaco City', province: 'Albay', gate: 4, distance_km: 470, avg_duration_mins: 540, fare: 680 },
  { id: 'route-10', destination: 'Legazpi City', province: 'Albay', gate: 4, distance_km: 485, avg_duration_mins: 555, fare: 700 },
  { id: 'route-11', destination: 'Naga City', province: 'Camarines Sur', gate: 4, distance_km: 390, avg_duration_mins: 450, fare: 580 },
  { id: 'route-12', destination: 'Sorsogon City', province: 'Sorsogon', gate: 4, distance_km: 565, avg_duration_mins: 645, fare: 800 },
  { id: 'route-13', destination: 'Daet', province: 'Camarines Norte', gate: 4, distance_km: 355, avg_duration_mins: 420, fare: 540 },
  { id: 'route-14', destination: 'Matnog', province: 'Sorsogon', gate: 4, distance_km: 605, avg_duration_mins: 690, fare: 850 },
  { id: 'route-15', destination: 'Virac', province: 'Catanduanes', gate: 4, distance_km: 480, avg_duration_mins: 600, fare: 720 },
  { id: 'route-16', destination: 'Iriga', province: 'Camarines Sur', gate: 4, distance_km: 410, avg_duration_mins: 480, fare: 620 },
  { id: 'route-17', destination: 'Gubat', province: 'Sorsogon', gate: 4, distance_km: 550, avg_duration_mins: 630, fare: 780 },
  
  // Gate 5 - Northern Luzon
  { id: 'route-18', destination: 'Olongapo City', province: 'Zambales', gate: 5, distance_km: 130, avg_duration_mins: 180, fare: 200 },
  { id: 'route-19', destination: 'Baguio City', province: 'Benguet', gate: 5, distance_km: 250, avg_duration_mins: 360, fare: 450 },
  { id: 'route-20', destination: 'Dagupan City', province: 'Pangasinan', gate: 5, distance_km: 240, avg_duration_mins: 330, fare: 420 },
  { id: 'route-21', destination: 'San Carlos City', province: 'Pangasinan', gate: 5, distance_km: 260, avg_duration_mins: 360, fare: 460 },
  { id: 'route-22', destination: 'Tuguegarao City', province: 'Cagayan', gate: 5, distance_km: 480, avg_duration_mins: 600, fare: 750 },
  { id: 'route-23', destination: 'San Jose Nueva Ecija', province: 'Nueva Ecija', gate: 5, distance_km: 160, avg_duration_mins: 210, fare: 260 },
];

// ============================================================================
// BUSES (Fleet - Mix across operators)
// ============================================================================

export interface Bus {
  id: string;
  plate_number: string;
  operator_id: string;
  capacity: number;
  status: BusStatus;
  fuel_level: number;
  last_maintenance: Date;
}

export const mockBuses: Bus[] = [
  // JAM/CHER (Gate 2)
  { id: 'BUS-001', plate_number: 'ABC-1234', operator_id: 'op-1', capacity: 50, status: 'active', fuel_level: 85, last_maintenance: new Date('2026-01-10') },
  { id: 'BUS-002', plate_number: 'ABC-1235', operator_id: 'op-1', capacity: 50, status: 'active', fuel_level: 92, last_maintenance: new Date('2026-01-08') },
  
  // ALPS (Gate 2 & 4)
  { id: 'BUS-003', plate_number: 'XYZ-5678', operator_id: 'op-2', capacity: 45, status: 'active', fuel_level: 78, last_maintenance: new Date('2026-01-12') },
  { id: 'BUS-004', plate_number: 'XYZ-5679', operator_id: 'op-2', capacity: 45, status: 'active', fuel_level: 65, last_maintenance: new Date('2026-01-09') },
  { id: 'BUS-005', plate_number: 'XYZ-5680', operator_id: 'op-2', capacity: 45, status: 'maintenance', fuel_level: 30, last_maintenance: new Date('2026-01-05') },
  
  // DLTB (Gate 4)
  { id: 'BUS-006', plate_number: 'DEF-9012', operator_id: 'op-10', capacity: 55, status: 'active', fuel_level: 88, last_maintenance: new Date('2026-01-13') },
  { id: 'BUS-007', plate_number: 'DEF-9013', operator_id: 'op-10', capacity: 55, status: 'active', fuel_level: 95, last_maintenance: new Date('2026-01-07') },
  
  // Victory Liner (Gate 5)
  { id: 'BUS-008', plate_number: 'GHI-3456', operator_id: 'op-19', capacity: 55, status: 'active', fuel_level: 90, last_maintenance: new Date('2026-01-14') },
  { id: 'BUS-009', plate_number: 'GHI-3457', operator_id: 'op-19', capacity: 55, status: 'active', fuel_level: 82, last_maintenance: new Date('2026-01-10') },
  
  // Solid North (Gate 5)
  { id: 'BUS-010', plate_number: 'JKL-7890', operator_id: 'op-20', capacity: 50, status: 'active', fuel_level: 75, last_maintenance: new Date('2026-01-11') },
  { id: 'BUS-011', plate_number: 'JKL-7891', operator_id: 'op-20', capacity: 50, status: 'active', fuel_level: 68, last_maintenance: new Date('2026-01-09') },
  
  // Baliwag (Gate 5)
  { id: 'BUS-012', plate_number: 'MNO-2345', operator_id: 'op-21', capacity: 50, status: 'active', fuel_level: 80, last_maintenance: new Date('2026-01-12') },
  { id: 'BUS-013', plate_number: 'MNO-2346', operator_id: 'op-21', capacity: 50, status: 'off-duty', fuel_level: 45, last_maintenance: new Date('2026-01-08') },
  
  // Cagsawa (Gate 4)
  { id: 'BUS-014', plate_number: 'PQR-6789', operator_id: 'op-11', capacity: 48, status: 'active', fuel_level: 87, last_maintenance: new Date('2026-01-13') },
  { id: 'BUS-015', plate_number: 'PQR-6790', operator_id: 'op-11', capacity: 48, status: 'active', fuel_level: 72, last_maintenance: new Date('2026-01-10') },
];

// ============================================================================
// TRIPS (Today's Schedule - Real PITX Format)
// ============================================================================

export interface Trip {
  id: string;
  bus_id: string;
  route_id: string;
  scheduled_time: Date;
  actual_departure?: Date;
  gate: number;
  bay: number;
  status: TripStatus;
  passengers: number;
  delay_minutes: number;
  delay_reason?: DelayReason;
  driver_name: string;
  updated_at: Date;
}

// Helper to create today's date with specific time
const createTodayTime = (hours: number, minutes: number): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const mockTrips: Trip[] = [
  // 2:30 PM - Gate 2 (Batangas)
  {
    id: 'trip-001',
    bus_id: 'BUS-001',
    route_id: 'route-3', // Balibago
    scheduled_time: createTodayTime(14, 30),
    gate: 2,
    bay: 8,
    status: 'boarding',
    passengers: 35,
    delay_minutes: 0,
    driver_name: 'Juan Dela Cruz',
    updated_at: new Date()
  },
  {
    id: 'trip-002',
    bus_id: 'BUS-003',
    route_id: 'route-2', // Lipa City
    scheduled_time: createTodayTime(14, 30),
    gate: 2,
    bay: 11,
    status: 'arriving',
    passengers: 42,
    delay_minutes: 0,
    driver_name: 'Maria Santos',
    updated_at: new Date()
  },
  
  // 2:30 PM - Gate 4 (Bicol)
  {
    id: 'trip-003',
    bus_id: 'BUS-014',
    route_id: 'route-9', // Tabaco City
    scheduled_time: createTodayTime(14, 30),
    gate: 4,
    bay: 20,
    status: 'arriving',
    passengers: 38,
    delay_minutes: 0,
    driver_name: 'Pedro Reyes',
    updated_at: new Date()
  },
  
  // 2:30 PM - Gate 5 (North Luzon)
  {
    id: 'trip-004',
    bus_id: 'BUS-012',
    route_id: 'route-23', // San Jose Nueva Ecija
    scheduled_time: createTodayTime(14, 30),
    gate: 5,
    bay: 33,
    status: 'boarding',
    passengers: 40,
    delay_minutes: 0,
    driver_name: 'Jose Garcia',
    updated_at: new Date()
  },
  {
    id: 'trip-005',
    bus_id: 'BUS-010',
    route_id: 'route-18', // Olongapo City
    scheduled_time: createTodayTime(14, 30),
    gate: 5,
    bay: 36,
    status: 'arriving',
    passengers: 30,
    delay_minutes: 0,
    driver_name: 'Roberto Cruz',
    updated_at: new Date()
  },
  
  // 3:00 PM - Gate 2
  {
    id: 'trip-006',
    bus_id: 'BUS-002',
    route_id: 'route-8', // Calauag
    scheduled_time: createTodayTime(15, 0),
    gate: 2,
    bay: 8,
    status: 'scheduled',
    passengers: 0,
    delay_minutes: 0,
    driver_name: 'Ana Lopez',
    updated_at: new Date()
  },
  
  // 3:00 PM - Gate 4
  {
    id: 'trip-007',
    bus_id: 'BUS-006',
    route_id: 'route-17', // Gubat
    scheduled_time: createTodayTime(15, 0),
    gate: 4,
    bay: 20,
    status: 'cancelled',
    passengers: 0,
    delay_minutes: 0,
    delay_reason: 'breakdown',
    driver_name: 'Carlos Mendoza',
    updated_at: new Date()
  },
  
  // 3:00 PM - Gate 5
  {
    id: 'trip-008',
    bus_id: 'BUS-008',
    route_id: 'route-22', // Tuguegarao City
    scheduled_time: createTodayTime(15, 0),
    gate: 5,
    bay: 33,
    status: 'scheduled',
    passengers: 0,
    delay_minutes: 0,
    driver_name: 'Miguel Torres',
    updated_at: new Date()
  },
  {
    id: 'trip-009',
    bus_id: 'BUS-011',
    route_id: 'route-21', // San Carlos City
    scheduled_time: createTodayTime(15, 0),
    gate: 5,
    bay: 35,
    status: 'scheduled',
    passengers: 0,
    delay_minutes: 0,
    driver_name: 'Sofia Ramirez',
    updated_at: new Date()
  },
  
  // 3:30 PM - Gate 2
  {
    id: 'trip-010',
    bus_id: 'BUS-004',
    route_id: 'route-1', // Batangas City
    scheduled_time: createTodayTime(15, 30),
    gate: 2,
    bay: 10,
    status: 'scheduled',
    passengers: 0,
    delay_minutes: 0,
    driver_name: 'Luis Fernandez',
    updated_at: new Date()
  },
  
  // 4:00 PM - Gate 2
  {
    id: 'trip-011',
    bus_id: 'BUS-001',
    route_id: 'route-2', // Lipa City
    scheduled_time: createTodayTime(16, 0),
    gate: 2,
    bay: 11,
    status: 'delayed',
    passengers: 28,
    delay_minutes: 15,
    delay_reason: 'traffic',
    driver_name: 'Juan Dela Cruz',
    updated_at: new Date()
  },
  
  // 4:00 PM - Gate 4
  {
    id: 'trip-012',
    bus_id: 'BUS-015',
    route_id: 'route-10', // Legazpi City
    scheduled_time: createTodayTime(16, 0),
    gate: 4,
    bay: 21,
    status: 'scheduled',
    passengers: 0,
    delay_minutes: 0,
    driver_name: 'Diego Santos',
    updated_at: new Date()
  },
  
  // 4:00 PM - Gate 5
  {
    id: 'trip-013',
    bus_id: 'BUS-009',
    route_id: 'route-20', // Dagupan City
    scheduled_time: createTodayTime(16, 0),
    gate: 5,
    bay: 33,
    status: 'boarding',
    passengers: 45,
    delay_minutes: 5,
    delay_reason: 'passenger',
    driver_name: 'Marco Reyes',
    updated_at: new Date()
  },
];

// ============================================================================
// DELAY LOGS
// ============================================================================

export interface DelayLog {
  id: string;
  trip_id: string;
  delay_minutes: number;
  reason: DelayReason;
  tagged_by: string;
  timestamp: Date;
  notes?: string;
}

export const mockDelayLogs: DelayLog[] = [
  {
    id: 'delay-001',
    trip_id: 'trip-011',
    delay_minutes: 15,
    reason: 'traffic',
    tagged_by: 'Dispatcher A',
    timestamp: new Date(),
    notes: 'Heavy traffic on Skyway'
  },
  {
    id: 'delay-002',
    trip_id: 'trip-013',
    delay_minutes: 5,
    reason: 'passenger',
    tagged_by: 'Dispatcher B',
    timestamp: new Date(),
    notes: 'Late passengers boarding'
  },
  {
    id: 'delay-003',
    trip_id: 'trip-007',
    delay_minutes: 0,
    reason: 'breakdown',
    tagged_by: 'Dispatcher A',
    timestamp: new Date(),
    notes: 'Engine failure - trip cancelled'
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getOperatorById(operatorId: string): Operator | undefined {
  return mockOperators.find(op => op.id === operatorId);
}

export function getRouteById(routeId: string): Route | undefined {
  return mockRoutes.find(route => route.id === routeId);
}

export function getBusById(busId: string): Bus | undefined {
  return mockBuses.find(bus => bus.id === busId);
}

export function getTripsByStatus(status: TripStatus): Trip[] {
  return mockTrips.filter(trip => trip.status === status);
}

export function getTripsByGate(gate: number): Trip[] {
  return mockTrips.filter(trip => trip.gate === gate);
}

export function getActiveBuses(): Bus[] {
  return mockBuses.filter(bus => bus.status === 'active');
}

export function getTodayTrips(): Trip[] {
  const today = new Date();
  return mockTrips.filter(trip => {
    const tripDate = new Date(trip.scheduled_time);
    return tripDate.toDateString() === today.toDateString();
  });
}

export function getDelayedTrips(): Trip[] {
  return mockTrips.filter(trip => trip.delay_minutes > 0 || trip.status === 'delayed');
}

// Status color configuration (aligned with design guide)
export const tripStatusConfig = {
  'scheduled': { label: 'Scheduled', color: 'bg-gray-500', icon: '⏰' },
  'arriving': { label: 'Arriving', color: 'bg-indigo-600', icon: '🚌' },
  'boarding': { label: 'Boarding', color: 'bg-emerald-500', icon: '🚶' },
  'departed': { label: 'Departed', color: 'bg-violet-500', icon: '✓' },
  'delayed': { label: 'Delayed', color: 'bg-amber-500', icon: '⏱️' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-500', icon: '✗' },
};

export const delayReasonConfig = {
  'traffic': { label: 'Heavy Traffic', icon: '🚦' },
  'breakdown': { label: 'Mechanical Issue', icon: '🔧' },
  'weather': { label: 'Weather Conditions', icon: '🌧️' },
  'passenger': { label: 'Passenger Delay', icon: '👥' },
  'accident': { label: 'Road Accident', icon: '⚠️' },
  'other': { label: 'Other', icon: '❓' },
};

export const busStatusConfig = {
  'active': { label: 'Active', color: 'bg-emerald-500', icon: '✓' },
  'maintenance': { label: 'Maintenance', color: 'bg-amber-500', icon: '🔧' },
  'off-duty': { label: 'Off Duty', color: 'bg-slate-500', icon: '🌙' },
};