import React, { useState, useEffect } from 'react';
import { Monitor, Plus, Settings, Activity, Clock } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MachineManager from './components/MachineManager';
import { Machine } from './types';

// Composant de progression circulaire
const CircularProgress: React.FC<{ 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  children?: React.ReactNode;
}> = ({ progress, size = 60, strokeWidth = 4, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-blue-500 transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Contenu au centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

function App() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'manage'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testingMachines, setTestingMachines] = useState<string[]>([]);
  const [globalPingInProgress, setGlobalPingInProgress] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState(30); // en secondes
  const [timeUntilNextCheck, setTimeUntilNextCheck] = useState(0);

  // Load machines on component mount
  useEffect(() => {
    loadMachines();
  }, []);

  // Auto-monitoring avec intervalle configurable
  useEffect(() => {
    if (isMonitoring) {
      setTimeUntilNextCheck(monitoringInterval);
      
      const interval = setInterval(() => {
        pingAllMachines();
        setTimeUntilNextCheck(monitoringInterval);
      }, monitoringInterval * 1000);

      // Décompte jusqu'à la prochaine vérification
      const countdownInterval = setInterval(() => {
        setTimeUntilNextCheck(prev => {
          if (prev <= 1) {
            return monitoringInterval;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(countdownInterval);
      };
    } else {
      setTimeUntilNextCheck(0);
    }
  }, [isMonitoring, monitoringInterval]);

  const loadMachines = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/machines');
      const data = await response.json();
      setMachines(data);
    } catch (error) {
      console.error('Failed to load machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const pingAllMachines = async () => {
    setGlobalPingInProgress(true);
    try {
      const response = await fetch('http://localhost:3001/api/machines/ping-all', {
        method: 'POST',
      });
      const results = await response.json();
      const updatedMachines = results.map((result: any) => result.machine);
      setMachines(updatedMachines);
    } catch (error) {
      console.error('Failed to ping machines:', error);
    } finally {
      setGlobalPingInProgress(false);
    }
  };

  const addMachine = async (machineData: Omit<Machine, 'id' | 'status' | 'lastCheck' | 'responseTime' | 'uptime' | 'downtime' | 'history' | 'uptimePercentage' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/machines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineData),
      });
      
      if (response.ok) {
        const newMachine = await response.json();
        setMachines(prev => [...prev, newMachine]);
      } else {
        const error = await response.json();
        console.error('Failed to add machine:', error.error);
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to add machine:', error);
      alert('Erreur lors de l\'ajout de la machine');
    }
  };

  const deleteMachine = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/machines/${id}`, {
        method: 'DELETE',
      });
      setMachines(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete machine:', error);
    }
  };

  const testMachine = async (id: string) => {
    setTestingMachines(prev => [...prev, id]);
    try {
      const response = await fetch(`http://localhost:3001/api/machines/${id}/ping`, {
        method: 'POST',
      });
      const result = await response.json();
      setMachines(prev => prev.map(m => m.id === id ? result.machine : m));
    } catch (error) {
      console.error('Failed to ping machine:', error);
    } finally {
      setTestingMachines(prev => prev.filter(machineId => machineId !== id));
    }
  };

  const getStatusStats = () => {
    const online = machines.filter(m => m.status === 'online').length;
    const offline = machines.filter(m => m.status === 'offline').length;
    const unknown = machines.filter(m => m.status === 'unknown').length;
    return { online, offline, unknown, total: machines.length };
  };

  const basicStats = getStatusStats();

  // Calculer le pourcentage de progression du décompte
  const progressPercentage = isMonitoring 
    ? ((monitoringInterval - timeUntilNextCheck) / monitoringInterval) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Chargement...</h2>
          <p className="text-gray-600 mt-2">Initialisation du système de monitoring</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header avec hauteur fixe */}
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Système de Monitoring
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Configuration de la fréquence de monitoring */}
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <label className="text-sm text-gray-700">Intervalle (s):</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={monitoringInterval}
                  onChange={(e) => setMonitoringInterval(parseInt(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isMonitoring}
                />
              </div>
              
              {/* Toggle monitoring */}
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isMonitoring
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>Arrêter surveillance</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    <span>Démarrer surveillance</span>
                  </>
                )}
              </button>

              <div className="flex rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-6 py-2 font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tableau de Bord
                </button>
                <button
                  onClick={() => setCurrentView('manage')}
                  className={`px-6 py-2 font-medium transition-colors ${
                    currentView === 'manage'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Gérer Machines
                </button>
              </div>
            </div>
          </div>

          {/* Barre d'indicateur de surveillance - hauteur fixe */}
          <div className="h-16 flex items-center justify-center border-t border-gray-100">
            {isMonitoring ? (
              <div className="flex items-center space-x-3 bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
                <CircularProgress 
                  progress={progressPercentage}
                  size={40}
                  strokeWidth={3}
                >
                  {globalPingInProgress ? (
                    <Activity className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-600" />
                  )}
                </CircularProgress>
                <div className="text-sm">
                  <div className="font-medium text-blue-900">
                    {globalPingInProgress ? 'Vérification en cours...' : 'Surveillance active'}
                  </div>
                  <div className="text-blue-600">
                    {globalPingInProgress 
                      ? `${machines.length} machines` 
                      : `Prochaine vérification: ${timeUntilNextCheck}s`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Surveillance désactivée</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'dashboard' ? (
          <Dashboard 
            machines={machines}
            onPingMachine={testMachine}
            pingInProgress={new Set(testingMachines)}
            stats={basicStats}
            globalPingInProgress={globalPingInProgress}
            onPingAll={pingAllMachines}
          />
        ) : (
          <MachineManager
            machines={machines}
            onAddMachine={addMachine}
            onDeleteMachine={deleteMachine}
            onTestMachine={testMachine}
            testingMachines={testingMachines}
          />
        )}
      </main>
    </div>
  );
}

export default App;