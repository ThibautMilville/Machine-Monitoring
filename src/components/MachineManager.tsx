import React, { useState, useMemo } from 'react';
import { Machine, MachineCategories } from '../types';
import { 
  Plus, 
  Trash2, 
  Zap, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Loader2,
  Server,
  Router,
  Shield,
  HardDrive,
  Globe,
  Monitor,
  Printer,
  Activity,
  Settings,
  Database,
  Wifi,
  Edit3,
  MoreVertical
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';

interface MachineManagerProps {
  machines: Machine[];
  onAddMachine: (machine: Omit<Machine, 'id' | 'status' | 'lastCheck' | 'responseTime' | 'uptime' | 'downtime' | 'history' | 'uptimePercentage' | 'createdAt'>) => void;
  onDeleteMachine: (id: string) => void;
  onTestMachine: (id: string) => void;
  testingMachines: string[];
}

const getCategoryIcon = (category: string, size = 20) => {
  const iconProps = { size, className: "text-gray-600" };
  
  switch (category) {
    case 'Server': return <Server {...iconProps} />;
    case 'Database': return <Database {...iconProps} />;
    case 'Web Server': return <Globe {...iconProps} />;
    case 'Application Server': return <Settings {...iconProps} />;
    case 'Router': return <Router {...iconProps} />;
    case 'Switch': return <Wifi {...iconProps} />;
    case 'Firewall': return <Shield {...iconProps} />;
    case 'Load Balancer': return <Activity {...iconProps} />;
    case 'Workstation': return <Monitor {...iconProps} />;
    case 'Printer': return <Printer {...iconProps} />;
    default: return <HardDrive {...iconProps} />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online': return <CheckCircle size={16} className="text-emerald-500" />;
    case 'offline': return <XCircle size={16} className="text-red-500" />;
    default: return <AlertTriangle size={16} className="text-amber-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'En ligne';
    case 'offline': return 'Hors ligne';
    default: return 'Inconnu';
  }
};

const MachineManager: React.FC<MachineManagerProps> = ({
  machines,
  onAddMachine,
  onDeleteMachine,
  onTestMachine,
  testingMachines
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'status' | 'lastCheck'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [newMachine, setNewMachine] = useState({
    name: '',
    host: '',
    description: '',
    category: 'Server' as keyof typeof MachineCategories
  });

  const categories = Object.keys(MachineCategories) as (keyof typeof MachineCategories)[];

  const filteredAndSortedMachines = useMemo(() => {
    let filtered = machines.filter(machine => {
      const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           machine.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           machine.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || machine.category === categoryFilter;
      const matchesStatus = !statusFilter || machine.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastCheck':
          aValue = a.lastCheck ? new Date(a.lastCheck).getTime() : 0;
          bValue = b.lastCheck ? new Date(b.lastCheck).getTime() : 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [machines, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  const handleAddMachine = () => {
    if (newMachine.name && newMachine.host) {
      onAddMachine(newMachine);
      setNewMachine({ name: '', host: '', description: '', category: 'Server' });
      setShowAddModal(false);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Machines</h2>
          <p className="text-gray-600 mt-1">Configurez et gérez vos équipements réseau</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Ajouter une machine
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{MachineCategories[category]}</option>
              ))}
            </select>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="offline">Hors ligne</option>
            <option value="unknown">Inconnu</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('name')}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                sortBy === 'name' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Nom {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
            </button>
          </div>
        </div>
      </div>

      {/* Machine Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedMachines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg flex flex-col h-full"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getCategoryIcon(machine.category, 24)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{machine.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{MachineCategories[machine.category as keyof typeof MachineCategories]}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(machine.status)}
                  <span className="text-sm font-medium text-gray-700">
                    {getStatusText(machine.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content - flex-grow pour occuper l'espace disponible */}
            <div className="p-6 space-y-4 flex-grow flex flex-col">
              <div className="space-y-3 flex-grow">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Adresse IP</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono text-xs">
                    {machine.host}
                  </code>
                </div>
                
                {machine.description && (
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-gray-500 flex-shrink-0">Description</span>
                    <span className="text-gray-700 text-right ml-2">{machine.description}</span>
                  </div>
                )}

                {machine.responseTime !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Latence</span>
                    <span className="text-gray-700 font-medium">{machine.responseTime}ms</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Disponibilité</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${machine.uptimePercentage}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-700">{machine.uptimePercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Actions - toujours en bas grâce à mt-auto */}
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onTestMachine(machine.id)}
                    disabled={testingMachines.includes(machine.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingMachines.includes(machine.id) ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Test...
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="mr-2" />
                        Tester
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setDeleteConfirm(machine.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedMachines.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Monitor size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune machine trouvée</h3>
          <p className="text-gray-500">Ajustez vos filtres ou ajoutez une nouvelle machine.</p>
        </div>
      )}

      {/* Add Machine Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter une nouvelle machine">
        <div className="space-y-6">
          {/* Grille de champs modernisée */}
          <div className="grid grid-cols-1 gap-6">
            {/* Nom de la machine */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                Nom de la machine
              </label>
              <input
                type="text"
                value={newMachine.name}
                onChange={(e) => setNewMachine(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400"
                placeholder="Ex: SRV-WEB-001"
              />
              <p className="text-xs text-gray-500">Identifiant unique pour votre machine</p>
            </div>
            
            {/* Adresse IP/Hostname */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                Adresse IP ou nom d'hôte
              </label>
              <input
                type="text"
                value={newMachine.host}
                onChange={(e) => setNewMachine(prev => ({ ...prev, host: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400 font-mono text-sm"
                placeholder="Ex: 192.168.1.100 ou serveur.domain.com"
              />
              <p className="text-xs text-gray-500">Adresse réseau pour les tests de connectivité</p>
            </div>
            
            {/* Catégorie avec design amélioré */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Catégorie
              </label>
              <div className="relative">
                <select
                  value={newMachine.category}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, category: e.target.value as keyof typeof MachineCategories }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {MachineCategories[category]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="w-5 h-5 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">Type d'équipement réseau</p>
            </div>
            
            {/* Description avec design amélioré */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Description
                <span className="text-xs text-gray-500 ml-2">(optionnel)</span>
              </label>
              <textarea
                value={newMachine.description}
                onChange={(e) => setNewMachine(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400 resize-none"
                rows={3}
                placeholder="Description détaillée de la machine et de son rôle..."
              />
              <p className="text-xs text-gray-500">Informations additionnelles pour identifier la machine</p>
            </div>
          </div>
          
          {/* Séparateur avec style */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-xs text-gray-500 font-medium">Actions</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
          
          {/* Boutons d'action améliorés */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              Annuler
            </button>
            <button
              onClick={handleAddMachine}
              disabled={!newMachine.name || !newMachine.host}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <span className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Ajouter la machine</span>
              </span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            onDeleteMachine(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Supprimer la machine"
        message={`Êtes-vous sûr de vouloir supprimer cette machine ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <Activity size={20} className="mr-2" />
          Comment remettre une machine en ligne ?
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Vérifiez la connectivité réseau :</strong> Assurez-vous que la machine est allumée et connectée au réseau</p>
          <p>• <strong>Testez manuellement :</strong> Utilisez le bouton "Tester" pour vérifier la connectivité</p>
          <p>• <strong>Surveillance automatique :</strong> La surveillance vérifie automatiquement toutes les machines selon l'intervalle configuré</p>
        </div>
      </div>
    </div>
  );
};

export default MachineManager;