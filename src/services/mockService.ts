import { Machine } from '../types';

// Données initiales des machines
const initialMachines: Machine[] = [
  {
    id: "1",
    name: "SRV-PARIS-001",
    host: "8.8.8.8",
    description: "Serveur principal - Datacenter Paris",
    category: "Server",
    status: "online",
    lastCheck: new Date().toISOString(),
    responseTime: 25,
    uptime: 720,
    downtime: 15,
    history: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 22
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 28
      },
      {
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 24
      }
    ],
    uptimePercentage: 98.0,
    createdAt: "2024-01-15T08:00:00.000Z"
  },
  {
    id: "2",
    name: "SRV-MARSEILLE-001",
    host: "1.1.1.1",
    description: "Serveur principal - Datacenter Marseille",
    category: "Server",
    status: "online",
    lastCheck: new Date().toISOString(),
    responseTime: 32,
    uptime: 680,
    downtime: 25,
    history: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 30
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 35
      }
    ],
    uptimePercentage: 96.4,
    createdAt: "2024-02-10T10:30:00.000Z"
  },
  {
    id: "3",
    name: "SRV-LYON-001",
    host: "9.9.9.9",
    description: "Serveur principal - Datacenter Lyon",
    category: "Server",
    status: "online",
    lastCheck: new Date().toISOString(),
    responseTime: 18,
    uptime: 700,
    downtime: 20,
    history: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 16
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 20
      }
    ],
    uptimePercentage: 97.2,
    createdAt: "2024-01-20T14:15:00.000Z"
  },
  {
    id: "4",
    name: "SRV-TOULOUSE-001",
    host: "8.8.4.4",
    description: "Serveur principal - Datacenter Toulouse",
    category: "Server",
    status: "online",
    lastCheck: new Date().toISOString(),
    responseTime: 27,
    uptime: 650,
    downtime: 30,
    history: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 25
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 29
      }
    ],
    uptimePercentage: 95.6,
    createdAt: "2024-01-05T09:00:00.000Z"
  },
  {
    id: "5",
    name: "SRV-BORDEAUX-001",
    host: "208.67.222.222",
    description: "Serveur principal - Datacenter Bordeaux",
    category: "Server",
    status: "online",
    lastCheck: new Date().toISOString(),
    responseTime: 35,
    uptime: 620,
    downtime: 40,
    history: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 33
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: "online",
        responseTime: 37
      }
    ],
    uptimePercentage: 93.9,
    createdAt: "2024-03-01T11:45:00.000Z"
  }
];

class MockService {
  private machines: Machine[] = [];
  private alerts: any[] = [];
  private simulatedFailures: Set<string> = new Set(); // IDs des machines en panne simulée

  constructor() {
    // Charger les données depuis localStorage ou utiliser les données initiales
    const savedMachines = localStorage.getItem('poc-cesi-machines');
    if (savedMachines) {
      this.machines = JSON.parse(savedMachines);
    } else {
      this.machines = [...initialMachines];
      this.saveMachines();
    }
  }

  private saveMachines() {
    localStorage.setItem('poc-cesi-machines', JSON.stringify(this.machines));
  }

  private calculateUptime(history: any[]): number {
    if (!history || history.length === 0) return 0;
    const onlineCount = history.filter(h => h.status === 'online').length;
    return Math.round((onlineCount / history.length) * 100);
  }

  private simulatePing(host: string, machineId?: string): Promise<{ alive: boolean; time: number | null }> {
    return new Promise((resolve) => {
      // Simuler un délai de ping réaliste
      const delay = Math.random() * 1000 + 200; // 200ms à 1200ms
      
      setTimeout(() => {
        // Si la machine est en panne simulée, elle doit toujours être hors ligne
        if (machineId && this.simulatedFailures.has(machineId)) {
          resolve({ alive: false, time: null });
          return;
        }
        
        // Serveurs publics connus - probabilité élevée d'être en ligne
        const reliableServers = ['8.8.8.8', '1.1.1.1', '9.9.9.9', '8.8.4.4', '208.67.222.222'];
        const isReliable = reliableServers.includes(host);
        
        // 95% de chance d'être en ligne pour les serveurs fiables, 80% pour les autres
        const successRate = isReliable ? 0.95 : 0.80;
        const alive = Math.random() < successRate;
        
        const time = alive ? Math.floor(Math.random() * 100) + 10 : null; // 10-110ms si en ligne
        
        resolve({ alive, time });
      }, delay);
    });
  }

  async getMachines(): Promise<Machine[]> {
    return [...this.machines];
  }

  isSimulatedFailure(id: string): boolean {
    return this.simulatedFailures.has(id);
  }

  async addMachine(machineData: Omit<Machine, 'id' | 'status' | 'lastCheck' | 'responseTime' | 'uptime' | 'downtime' | 'history' | 'uptimePercentage' | 'createdAt'>): Promise<Machine> {
    // Vérifier si l'host existe déjà
    const existingMachine = this.machines.find(m => m.host === machineData.host);
    if (existingMachine) {
      throw new Error('A machine with this host already exists');
    }

    const newMachine: Machine = {
      ...machineData,
      id: Date.now().toString(),
      status: 'unknown',
      lastCheck: null,
      responseTime: null,
      uptime: 0,
      downtime: 0,
      history: [],
      uptimePercentage: 0,
      createdAt: new Date().toISOString()
    };

    this.machines.push(newMachine);
    this.saveMachines();
    return newMachine;
  }

  async deleteMachine(id: string): Promise<void> {
    this.machines = this.machines.filter(m => m.id !== id);
    this.saveMachines();
  }

  async pingMachine(id: string): Promise<{ machine: Machine; pingResult: any }> {
    const machine = this.machines.find(m => m.id === id);
    if (!machine) {
      throw new Error('Machine not found');
    }

    const pingResult = await this.simulatePing(machine.host, machine.id);
    const now = new Date().toISOString();

    // Mettre à jour le statut de la machine
    machine.status = pingResult.alive ? 'online' : 'offline';
    machine.lastCheck = now;
    machine.responseTime = pingResult.time;

    // Ajouter à l'historique
    machine.history = machine.history || [];
    machine.history.push({
      timestamp: now,
      status: machine.status,
      responseTime: pingResult.time
    });

    // Garder seulement les 50 dernières entrées
    if (machine.history.length > 50) {
      machine.history = machine.history.slice(-50);
    }

    // Recalculer le pourcentage d'uptime
    machine.uptimePercentage = this.calculateUptime(machine.history);

    this.saveMachines();
    return { machine, pingResult };
  }

  async pingAllMachines(): Promise<{ machine: Machine; pingResult: any }[]> {
    const results = await Promise.all(
      this.machines.map(machine => this.pingMachine(machine.id))
    );
    return results;
  }

  async simulateFailure(id: string, status: 'online' | 'offline'): Promise<{ machine: Machine; simulated: boolean }> {
    const machine = this.machines.find(m => m.id === id);
    if (!machine) {
      throw new Error('Machine not found');
    }

    const now = new Date().toISOString();

    // Gérer l'état de panne simulée
    if (status === 'offline') {
      this.simulatedFailures.add(id);
    } else {
      this.simulatedFailures.delete(id);
    }

    // Mettre à jour le statut
    machine.status = status;
    machine.lastCheck = now;
    machine.responseTime = status === 'offline' ? null : Math.floor(Math.random() * 50) + 10;

    // Ajouter à l'historique
    machine.history = machine.history || [];
    machine.history.push({
      timestamp: now,
      status: machine.status,
      responseTime: machine.responseTime
    });

    // Garder seulement les 50 dernières entrées
    if (machine.history.length > 50) {
      machine.history = machine.history.slice(-50);
    }

    // Recalculer le pourcentage d'uptime
    machine.uptimePercentage = this.calculateUptime(machine.history);

    this.saveMachines();
    return { machine, simulated: true };
  }

  // Simulation automatique de changements d'état aléatoires
  startRandomSimulation(callback: (machines: Machine[]) => void, intervalMs: number = 30000) {
    return setInterval(async () => {
      // Choisir aléatoirement une machine qui n'est pas en panne simulée
      const availableMachines = this.machines.filter(m => !this.simulatedFailures.has(m.id));
      
      if (availableMachines.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMachines.length);
        const machine = availableMachines[randomIndex];
        
        // 5% de chance de changer d'état (réduit pour éviter trop de changements)
        if (Math.random() < 0.05) {
          // Simuler un ping normal qui peut échouer naturellement
          const pingResult = await this.simulatePing(machine.host, machine.id);
          const now = new Date().toISOString();
          
          machine.status = pingResult.alive ? 'online' : 'offline';
          machine.lastCheck = now;
          machine.responseTime = pingResult.time;
          
          // Ajouter à l'historique
          machine.history = machine.history || [];
          machine.history.push({
            timestamp: now,
            status: machine.status,
            responseTime: pingResult.time
          });
          
          if (machine.history.length > 50) {
            machine.history = machine.history.slice(-50);
          }
          
          machine.uptimePercentage = this.calculateUptime(machine.history);
          this.saveMachines();
          callback([...this.machines]);
        }
      }
    }, intervalMs);
  }
}

export const mockService = new MockService(); 