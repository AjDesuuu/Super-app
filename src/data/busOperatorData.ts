// Bus Operator Dashboard - Mock Data
// Single source of truth for all bus liner operations

export type BusStatus = 'on-route' | 'delayed' | 'stopped' | 'off-duty' | 'maintenance';

export interface Stop {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  order: number;
  avgDwellTime: number; // seconds
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: Stop[];
  distance: number; // km
  avgDuration: number; // minutes
  fare: number; // pesos
  color: string; // for map display
}

export interface Bus {
  id: string;
  plateNumber: string;
  routeId: string;
  driver: string;
  operatorId?: string;
  status: BusStatus;
  location: { lat: number; lng: number };
  currentStop: string;
  nextStop: string;
  passengers: number;
  capacity: number;
  speed: number; // km/h
  fuelLevel: number; // percentage
  lastUpdate: Date;
  delayMinutes: number;
  delayReason?: string;
  estimatedArrival?: Date; 
  etaMinutes?: number;
}

export interface Operator {
  id: string;
  name: string;
  shortName: string;
}

export const mockOperators: Operator[] = [
  { id: 'op-1', name: 'JAM/CHER Transport', shortName: 'JAM/CHER' },
  { id: 'op-2', name: 'ALPS The Bus Inc.', shortName: 'ALPS' },
  { id: 'op-3', name: 'Victory Liner Inc.', shortName: 'Victory Liner' },
  { id: 'op-4', name: 'Baliwag Transit Inc.', shortName: 'Baliwag' },
  { id: 'op-5', name: 'Five Star Bus Company', shortName: 'Five Star' },
];

export interface Trip {
  id: string;
  busId: string;
  routeId: string;
  scheduledDeparture: Date;
  actualDeparture: Date | null;
  scheduledArrival: Date;
  actualArrival: Date | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  delayMinutes: number;
  delayReason?: string;
  stopsCompleted: number;
  totalStops: number;
}

// Status configuration
export const busStatusConfig = {
  'on-route': {
    label: 'On Route',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Moving normally'
  },
  'delayed': {
    label: 'Delayed',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Behind schedule'
  },
  'stopped': {
    label: 'Stopped',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Idle >10 mins'
  },
  'off-duty': {
    label: 'Off Duty',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Parked/Inactive'
  },
  'maintenance': {
    label: 'Maintenance',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Under repair'
  }
} as const;

// Delay reasons
export const delayReasons = [
  { id: 'traffic', label: 'Heavy Traffic' },
  { id: 'breakdown', label: 'Mechanical Issue' },
  { id: 'weather', label: 'Weather Conditions' },
  { id: 'passenger', label: 'Passenger Delay' },
  { id: 'accident', label: 'Road Accident' },
  { id: 'other', label: 'Other' }
] as const;

// Mock Routes (Major PITX routes in Metro Manila)
export const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'PITX → Cubao',
    origin: 'PITX',
    destination: 'Cubao',
    distance: 18.5,
    avgDuration: 65,
    fare: 50,
    color: '#3b82f6', // blue
    stops: [
      { id: 's1-1', name: 'PITX Terminal', location: { lat: 14.4515, lng: 120.9923 }, order: 1, avgDwellTime: 120 },
      { id: 's1-2', name: 'Coastal Mall', location: { lat: 14.4625, lng: 120.9935 }, order: 2, avgDwellTime: 45 },
      { id: 's1-3', name: 'SM Mall of Asia', location: { lat: 14.5351, lng: 120.9820 }, order: 3, avgDwellTime: 60 },
      { id: 's1-4', name: 'EDSA-Taft', location: { lat: 14.5386, lng: 121.0004 }, order: 4, avgDwellTime: 50 },
      { id: 's1-5', name: 'Ayala Avenue', location: { lat: 14.5547, lng: 121.0244 }, order: 5, avgDwellTime: 55 },
      { id: 's1-6', name: 'Ortigas Center', location: { lat: 14.5864, lng: 121.0561 }, order: 6, avgDwellTime: 50 },
      { id: 's1-7', name: 'Cubao Terminal', location: { lat: 14.6191, lng: 121.0518 }, order: 7, avgDwellTime: 90 }
    ]
  },
  {
    id: 'route-2',
    name: 'Cubao → PITX',
    origin: 'Cubao',
    destination: 'PITX',
    distance: 18.5,
    avgDuration: 70,
    fare: 50,
    color: '#10b981', // green
    stops: [
      { id: 's2-1', name: 'Cubao Terminal', location: { lat: 14.6191, lng: 121.0518 }, order: 1, avgDwellTime: 120 },
      { id: 's2-2', name: 'Ortigas Center', location: { lat: 14.5864, lng: 121.0561 }, order: 2, avgDwellTime: 50 },
      { id: 's2-3', name: 'Ayala Avenue', location: { lat: 14.5547, lng: 121.0244 }, order: 3, avgDwellTime: 55 },
      { id: 's2-4', name: 'EDSA-Taft', location: { lat: 14.5386, lng: 121.0004 }, order: 4, avgDwellTime: 50 },
      { id: 's2-5', name: 'SM Mall of Asia', location: { lat: 14.5351, lng: 120.9820 }, order: 5, avgDwellTime: 60 },
      { id: 's2-6', name: 'Coastal Mall', location: { lat: 14.4625, lng: 120.9935 }, order: 6, avgDwellTime: 45 },
      { id: 's2-7', name: 'PITX Terminal', location: { lat: 14.4515, lng: 120.9923 }, order: 7, avgDwellTime: 90 }
    ]
  },
  {
    id: 'route-3',
    name: 'PITX → Fairview',
    origin: 'PITX',
    destination: 'Fairview',
    distance: 24.2,
    avgDuration: 85,
    fare: 65,
    color: '#f59e0b', // orange
    stops: [
      { id: 's3-1', name: 'PITX Terminal', location: { lat: 14.4515, lng: 120.9923 }, order: 1, avgDwellTime: 120 },
      { id: 's3-2', name: 'Baclaran', location: { lat: 14.5389, lng: 121.0008 }, order: 2, avgDwellTime: 50 },
      { id: 's3-3', name: 'Magallanes', location: { lat: 14.5420, lng: 121.0173 }, order: 3, avgDwellTime: 45 },
      { id: 's3-4', name: 'Quezon Avenue', location: { lat: 14.6295, lng: 121.0297 }, order: 4, avgDwellTime: 50 },
      { id: 's3-5', name: 'North Avenue', location: { lat: 14.6564, lng: 121.0323 }, order: 5, avgDwellTime: 55 },
      { id: 's3-6', name: 'Fairview Terminal', location: { lat: 14.7133, lng: 121.0577 }, order: 6, avgDwellTime: 90 }
    ]
  },
  {
    id: 'route-4',
    name: 'Fairview → PITX',
    origin: 'Fairview',
    destination: 'PITX',
    distance: 24.2,
    avgDuration: 90,
    fare: 65,
    color: '#ef4444', // red
    stops: [
      { id: 's4-1', name: 'Fairview Terminal', location: { lat: 14.7133, lng: 121.0577 }, order: 1, avgDwellTime: 120 },
      { id: 's4-2', name: 'North Avenue', location: { lat: 14.6564, lng: 121.0323 }, order: 2, avgDwellTime: 55 },
      { id: 's4-3', name: 'Quezon Avenue', location: { lat: 14.6295, lng: 121.0297 }, order: 3, avgDwellTime: 50 },
      { id: 's4-4', name: 'Magallanes', location: { lat: 14.5420, lng: 121.0173 }, order: 4, avgDwellTime: 45 },
      { id: 's4-5', name: 'Baclaran', location: { lat: 14.5389, lng: 121.0008 }, order: 5, avgDwellTime: 50 },
      { id: 's4-6', name: 'PITX Terminal', location: { lat: 14.4515, lng: 120.9923 }, order: 6, avgDwellTime: 90 }
    ]
  }
];

// Mock Buses (20 buses across 4 routes)
export const mockBuses: Bus[] = [
  // Route 1: PITX → Cubao (5 buses)
  {
    id: 'BUS-001',
    plateNumber: 'ABC-1234',
    routeId: 'route-1',
    driver: 'Juan Dela Cruz',
    status: 'on-route',
    location: { lat: 14.5547, lng: 121.0244 }, // Ayala
    currentStop: 'Ayala Avenue',
    nextStop: 'Ortigas Center',
    passengers: 35,
    capacity: 50,
    speed: 45,
    fuelLevel: 65,
    lastUpdate: new Date(),
    delayMinutes: 2
  },
  {
    id: 'BUS-002',
    plateNumber: 'ABC-5678',
    routeId: 'route-1',
    driver: 'Maria Santos',
    status: 'delayed',
    location: { lat: 14.5386, lng: 121.0004 }, // EDSA-Taft
    currentStop: 'EDSA-Taft',
    nextStop: 'Ayala Avenue',
    passengers: 42,
    capacity: 50,
    speed: 15,
    fuelLevel: 45,
    lastUpdate: new Date(),
    delayMinutes: 12,
    delayReason: 'traffic'
  },
  {
    id: 'BUS-003',
    plateNumber: 'DEF-9012',
    routeId: 'route-1',
    driver: 'Pedro Reyes',
    status: 'on-route',
    location: { lat: 14.5351, lng: 120.9820 }, // MOA
    currentStop: 'SM Mall of Asia',
    nextStop: 'EDSA-Taft',
    passengers: 28,
    capacity: 50,
    speed: 50,
    fuelLevel: 80,
    lastUpdate: new Date(),
    delayMinutes: 0
  },
  {
    id: 'BUS-004',
    plateNumber: 'GHI-3456',
    routeId: 'route-1',
    driver: 'Rosa Garcia',
    status: 'stopped',
    location: { lat: 14.4625, lng: 120.9935 }, // Coastal
    currentStop: 'Coastal Mall',
    nextStop: 'SM Mall of Asia',
    passengers: 15,
    capacity: 50,
    speed: 0,
    fuelLevel: 25,
    lastUpdate: new Date(),
    delayMinutes: 15,
    delayReason: 'breakdown'
  },
  {
    id: 'BUS-005',
    plateNumber: 'JKL-7890',
    routeId: 'route-1',
    driver: 'Antonio Lopez',
    status: 'on-route',
    location: { lat: 14.6191, lng: 121.0518 }, // Cubao
    currentStop: 'Ortigas Center',
    nextStop: 'Cubao Terminal',
    passengers: 38,
    capacity: 50,
    speed: 40,
    fuelLevel: 55,
    lastUpdate: new Date(),
    delayMinutes: 5
  },

  // Route 2: Cubao → PITX (5 buses)
  {
    id: 'BUS-006',
    plateNumber: 'MNO-1234',
    routeId: 'route-2',
    driver: 'Carmen Torres',
    status: 'on-route',
    location: { lat: 14.5864, lng: 121.0561 }, // Ortigas
    currentStop: 'Ortigas Center',
    nextStop: 'Ayala Avenue',
    passengers: 40,
    capacity: 50,
    speed: 42,
    fuelLevel: 70,
    lastUpdate: new Date(),
    delayMinutes: 3
  },
  {
    id: 'BUS-007',
    plateNumber: 'PQR-5678',
    routeId: 'route-2',
    driver: 'Roberto Aquino',
    status: 'on-route',
    location: { lat: 14.5547, lng: 121.0244 }, // Ayala
    currentStop: 'Ayala Avenue',
    nextStop: 'EDSA-Taft',
    passengers: 33,
    capacity: 50,
    speed: 48,
    fuelLevel: 60,
    lastUpdate: new Date(),
    delayMinutes: 0
  },
  {
    id: 'BUS-008',
    plateNumber: 'STU-9012',
    routeId: 'route-2',
    driver: 'Elena Ramos',
    status: 'delayed',
    location: { lat: 14.5386, lng: 121.0004 }, // EDSA-Taft
    currentStop: 'EDSA-Taft',
    nextStop: 'SM Mall of Asia',
    passengers: 45,
    capacity: 50,
    speed: 20,
    fuelLevel: 50,
    lastUpdate: new Date(),
    delayMinutes: 18,
    delayReason: 'traffic'
  },
  {
    id: 'BUS-009',
    plateNumber: 'VWX-3456',
    routeId: 'route-2',
    driver: 'Miguel Cruz',
    status: 'on-route',
    location: { lat: 14.4625, lng: 120.9935 }, // Coastal
    currentStop: 'Coastal Mall',
    nextStop: 'PITX Terminal',
    passengers: 22,
    capacity: 50,
    speed: 35,
    fuelLevel: 40,
    lastUpdate: new Date(),
    delayMinutes: 7
  },
  {
    id: 'BUS-010',
    plateNumber: 'YZA-7890',
    routeId: 'route-2',
    driver: 'Sofia Mendoza',
    status: 'off-duty',
    location: { lat: 14.4515, lng: 120.9923 }, // PITX
    currentStop: 'PITX Terminal',
    nextStop: 'PITX Terminal',
    passengers: 0,
    capacity: 50,
    speed: 0,
    fuelLevel: 95,
    lastUpdate: new Date(),
    delayMinutes: 0
  },

  // Route 3: PITX → Fairview (5 buses)
  {
    id: 'BUS-011',
    plateNumber: 'BCD-1111',
    routeId: 'route-3',
    driver: 'Daniel Santos',
    status: 'on-route',
    location: { lat: 14.6295, lng: 121.0297 }, // Quezon Ave
    currentStop: 'Quezon Avenue',
    nextStop: 'North Avenue',
    passengers: 37,
    capacity: 50,
    speed: 44,
    fuelLevel: 58,
    lastUpdate: new Date(),
    delayMinutes: 4
  },
  {
    id: 'BUS-012',
    plateNumber: 'EFG-2222',
    routeId: 'route-3',
    driver: 'Isabella Cruz',
    status: 'delayed',
    location: { lat: 14.5420, lng: 121.0173 }, // Magallanes
    currentStop: 'Magallanes',
    nextStop: 'Quezon Avenue',
    passengers: 48,
    capacity: 50,
    speed: 18,
    fuelLevel: 42,
    lastUpdate: new Date(),
    delayMinutes: 22,
    delayReason: 'traffic'
  },
  {
    id: 'BUS-013',
    plateNumber: 'HIJ-3333',
    routeId: 'route-3',
    driver: 'Gabriel Reyes',
    status: 'on-route',
    location: { lat: 14.6564, lng: 121.0323 }, // North Ave
    currentStop: 'North Avenue',
    nextStop: 'Fairview Terminal',
    passengers: 30,
    capacity: 50,
    speed: 50,
    fuelLevel: 75,
    lastUpdate: new Date(),
    delayMinutes: 0
  },
  {
    id: 'BUS-014',
    plateNumber: 'KLM-4444',
    routeId: 'route-3',
    driver: 'Patricia Lopez',
    status: 'maintenance',
    location: { lat: 14.4515, lng: 120.9923 }, // PITX
    currentStop: 'PITX Terminal',
    nextStop: 'PITX Terminal',
    passengers: 0,
    capacity: 50,
    speed: 0,
    fuelLevel: 20,
    lastUpdate: new Date(),
    delayMinutes: 0
  },
  {
    id: 'BUS-015',
    plateNumber: 'NOP-5555',
    routeId: 'route-3',
    driver: 'Rafael Torres',
    status: 'on-route',
    location: { lat: 14.5389, lng: 121.0008 }, // Baclaran
    currentStop: 'Baclaran',
    nextStop: 'Magallanes',
    passengers: 25,
    capacity: 50,
    speed: 38,
    fuelLevel: 68,
    lastUpdate: new Date(),
    delayMinutes: 6
  },

  // Route 4: Fairview → PITX (5 buses)
  {
    id: 'BUS-016',
    plateNumber: 'QRS-6666',
    routeId: 'route-4',
    driver: 'Andrea Garcia',
    status: 'on-route',
    location: { lat: 14.6564, lng: 121.0323 }, // North Ave
    currentStop: 'North Avenue',
    nextStop: 'Quezon Avenue',
    passengers: 41,
    capacity: 50,
    speed: 46,
    fuelLevel: 62,
    lastUpdate: new Date(),
    delayMinutes: 1
  },
  {
    id: 'BUS-017',
    plateNumber: 'TUV-7777',
    routeId: 'route-4',
    driver: 'Carlos Mendoza',
    status: 'on-route',
    location: { lat: 14.6295, lng: 121.0297 }, // Quezon Ave
    currentStop: 'Quezon Avenue',
    nextStop: 'Magallanes',
    passengers: 36,
    capacity: 50,
    speed: 43,
    fuelLevel: 54,
    lastUpdate: new Date(),
    delayMinutes: 3
  },
  {
    id: 'BUS-018',
    plateNumber: 'WXY-8888',
    routeId: 'route-4',
    driver: 'Luisa Santos',
    status: 'stopped',
    location: { lat: 14.5420, lng: 121.0173 }, // Magallanes
    currentStop: 'Magallanes',
    nextStop: 'Baclaran',
    passengers: 20,
    capacity: 50,
    speed: 0,
    fuelLevel: 30,
    lastUpdate: new Date(),
    delayMinutes: 11,
    delayReason: 'passenger'
  },
  {
    id: 'BUS-019',
    plateNumber: 'ZAB-9999',
    routeId: 'route-4',
    driver: 'Fernando Cruz',
    status: 'delayed',
    location: { lat: 14.5389, lng: 121.0008 }, // Baclaran
    currentStop: 'Baclaran',
    nextStop: 'PITX Terminal',
    passengers: 44,
    capacity: 50,
    speed: 22,
    fuelLevel: 48,
    lastUpdate: new Date(),
    delayMinutes: 16,
    delayReason: 'weather'
  },
  {
    id: 'BUS-020',
    plateNumber: 'CDE-0000',
    routeId: 'route-4',
    driver: 'Victoria Reyes',
    status: 'on-route',
    location: { lat: 14.7133, lng: 121.0577 }, // Fairview
    currentStop: 'Fairview Terminal',
    nextStop: 'North Avenue',
    passengers: 32,
    capacity: 50,
    speed: 40,
    fuelLevel: 85,
    lastUpdate: new Date(),
    delayMinutes: 0
  }
];

// Helper function to get route by ID
export const getRouteById = (routeId: string): Route | undefined => {
  return mockRoutes.find(r => r.id === routeId);
};

// Helper function to get buses by route
export const getBusesByRoute = (routeId: string): Bus[] => {
  return mockBuses.filter(b => b.routeId === routeId);
};

// Helper function to get buses by status
export const getBusesByStatus = (status: BusStatus): Bus[] => {
  return mockBuses.filter(b => b.status === status);
};

// Calculate fleet statistics
export const getFleetStats = () => {
  const totalBuses = mockBuses.length;
  const activeBuses = mockBuses.filter(b => b.status === 'on-route' || b.status === 'delayed').length;
  const onTimeBuses = mockBuses.filter(b => b.delayMinutes <= 5).length;
  const avgDelay = mockBuses.reduce((sum, b) => sum + b.delayMinutes, 0) / totalBuses;
  
  return {
    total: totalBuses,
    active: activeBuses,
    onTimePercentage: Math.round((onTimeBuses / totalBuses) * 100),
    avgDelay: Math.round(avgDelay)
  };
};