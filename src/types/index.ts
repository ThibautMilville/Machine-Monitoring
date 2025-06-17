export interface Machine {
  id: string;
  name: string;
  host: string;
  description: string;
  category: 'Server' | 'Router' | 'Switch' | 'Web Server' | 'Database' | 'Workstation' | 'Printer' | 'Firewall' | 'Load Balancer' | 'Application Server';
  status: 'online' | 'offline' | 'unknown';
  lastCheck: string | null;
  responseTime: number | null;
  uptime: number;
  downtime: number;
  history: PingHistory[];
  uptimePercentage: number;
  createdAt: string;
}

export interface PingHistory {
  timestamp: string;
  status: 'online' | 'offline';
  responseTime: number | null;
}

export interface Stats {
  online: number;
  offline: number;
  unknown: number;
  total: number;
}

export interface PingResult {
  alive: boolean;
  time: number | null;
  timestamp: string;
  host: string;
  error?: string;
}

export const MachineCategories = [
  'Server',
  'Router',
  'Switch',
  'Firewall',
  'Workstation',
  'Printer',
  'Database',
  'Web Server',
  'Application Server',
  'Load Balancer'
] as const;

export type MachineCategory = typeof MachineCategories[number];