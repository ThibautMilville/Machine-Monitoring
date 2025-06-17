import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, RefreshCw, Zap, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import MachineCard from './MachineCard';
import { Machine } from '../types';

interface DashboardProps {
  machines: Machine[];
  onPingMachine: (id: string) => void;
  onPingAll: () => void;
  onSimulateFailure: (id: string) => void;
  stats: {
    online: number;
    offline: number;
    unknown: number;
    total: number;
  };
  pingInProgress: Set<string>;
  globalPingInProgress: boolean;
  simulationInProgress: Set<string>;
  simulatedFailures: Set<string>;
}

type SortOption = 'name' | 'status' | 'category' | 'uptime' | 'responseTime' | 'lastCheck';
type SortDirection = 'asc' | 'desc';

const Dashboard: React.FC<DashboardProps> = ({ 
  machines, 
  onPingMachine, 
  onPingAll, 
  onSimulateFailure,
  stats,
  pingInProgress,
  globalPingInProgress,
  simulationInProgress,
  simulatedFailures
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'unknown'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Obtenir toutes les catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(machines.map(m => m.category))];
    return uniqueCategories.sort();
  }, [machines]);

  // Filtrer et trier les machines
  const filteredAndSortedMachines = useMemo(() => {
    let filtered = machines.filter(machine => {
      const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           machine.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           machine.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || machine.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Trier
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'uptime':
          aValue = a.uptimePercentage;
          bValue = b.uptimePercentage;
          break;
        case 'responseTime':
          aValue = a.responseTime || 9999;
          bValue = b.responseTime || 9999;
          break;
        case 'lastCheck':
          aValue = a.lastCheck ? new Date(a.lastCheck).getTime() : 0;
          bValue = b.lastCheck ? new Date(b.lastCheck).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [machines, searchTerm, statusFilter, categoryFilter, sortBy, sortDirection]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('name');
    setSortDirection('asc');
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600 mt-1">
            Surveillance de {machines.length} machines
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onPingAll}
            disabled={globalPingInProgress}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
              globalPingInProgress
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {globalPingInProgress ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                <span>Tester tout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">{stats.online}</div>
              <div className="text-sm text-green-600 font-medium">En ligne</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-700">{stats.offline}</div>
              <div className="text-sm text-red-600 font-medium">Hors ligne</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-700">{stats.unknown}</div>
              <div className="text-sm text-yellow-600 font-medium">Inconnu</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-blue-600 font-medium">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, IP ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-3">
            <div className="min-w-[120px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="online">En ligne</option>
                <option value="offline">Hors ligne</option>
                <option value="unknown">Inconnu</option>
              </select>
            </div>

            <div className="min-w-[140px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Effacer les filtres"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Options de tri */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-gray-600 font-medium">Trier par:</span>
          {(['name', 'status', 'category', 'uptime', 'responseTime', 'lastCheck'] as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleSort(option)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                sortBy === option
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>
                {option === 'name' && 'Nom'}
                {option === 'status' && 'Statut'}
                {option === 'category' && 'Catégorie'}
                {option === 'uptime' && 'Uptime'}
                {option === 'responseTime' && 'Temps réponse'}
                {option === 'lastCheck' && 'Dernière vérif.'}
              </span>
              {sortBy === option && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Machines ({filteredAndSortedMachines.length})
          </h3>
        </div>

        {filteredAndSortedMachines.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune machine trouvée</h3>
            <p className="text-gray-500">
              {machines.length === 0 
                ? "Aucune machine configurée. Ajoutez-en une depuis l'onglet Gestion."
                : "Aucune machine ne correspond aux critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onPing={() => onPingMachine(machine.id)}
                isPinging={pingInProgress.has(machine.id)}
                onSimulateFailure={() => onSimulateFailure(machine.id)}
                isSimulatingFailure={simulationInProgress.has(machine.id)}
                isSimulatedFailure={simulatedFailures.has(machine.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;