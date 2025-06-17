import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Activity, Clock, Zap, Loader2 } from 'lucide-react';
import { Machine } from '../types';

// Icônes pour les catégories
const getCategoryIcon = (category: string) => {
  const iconClass = "h-5 w-5";
  switch (category.toLowerCase()) {
    case 'server':
      return <span className={`${iconClass} text-blue-500`}>🖥️</span>;
    case 'router':
      return <span className={`${iconClass} text-green-500`}>🔀</span>;
    case 'web server':
      return <span className={`${iconClass} text-purple-500`}>🌍</span>;
    case 'database':
      return <span className={`${iconClass} text-orange-500`}>🗄️</span>;
    case 'switch':
      return <span className={`${iconClass} text-teal-500`}>🔌</span>;
    case 'firewall':
      return <span className={`${iconClass} text-red-500`}>🛡️</span>;
    case 'load balancer':
      return <span className={`${iconClass} text-indigo-500`}>⚖️</span>;
    case 'workstation':
      return <span className={`${iconClass} text-gray-500`}>💻</span>;
    case 'printer':
      return <span className={`${iconClass} text-gray-500`}>🖨️</span>;
    case 'application server':
      return <span className={`${iconClass} text-pink-500`}>📱</span>;
    default:
      return <Activity className={`${iconClass} text-gray-500`} />;
  }
};

interface MachineCardProps {
  machine: Machine;
  onPing: () => void;
  isPinging?: boolean;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, onPing, isPinging = false }) => {
  const getStatusInfo = () => {
    switch (machine.status) {
      case 'online':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'En ligne',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        };
      case 'offline':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: 'Hors ligne',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          text: 'Inconnu',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700'
        };
    }
  };

  const formatLastCheck = (lastCheck: string) => {
    const date = new Date(lastCheck);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes === 1) return 'Il y a 1 minute';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minutes`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return 'Il y a 1 heure';
    if (diffHours < 24) return `Il y a ${diffHours} heures`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Il y a 1 jour';
    return `Il y a ${diffDays} jours`;
  };

  const getUptimeColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getResponseTimeColor = (time: number | null) => {
    if (!time) return 'text-gray-600 bg-gray-50 border-gray-200';
    if (time <= 100) return 'text-green-600 bg-green-50 border-green-200';
    if (time <= 500) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`
      bg-white rounded-xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-300 
      flex flex-col h-full
      ${isPinging ? 'animate-pulse border-blue-300' : statusInfo.borderColor}
    `}>
      {/* Header avec status et catégorie */}
      <div className={`p-4 rounded-t-xl border-b ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getCategoryIcon(machine.category)}
            <div>
              <h3 className={`font-semibold ${statusInfo.textColor}`}>{machine.name}</h3>
              <p className="text-sm text-gray-600">{machine.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {statusInfo.icon}
            <span className={`text-sm font-medium ${statusInfo.textColor}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu principal - flex-grow pour pousser le bouton vers le bas */}
      <div className="p-4 space-y-4 flex-grow flex flex-col">
        {/* Informations de base */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Adresse IP:</span>
            <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{machine.host}</span>
          </div>
          
          {machine.description && (
            <div className="text-sm">
              <span className="text-gray-600">Description:</span>
              <p className="text-gray-900 mt-1">{machine.description}</p>
            </div>
          )}
        </div>

        {/* Métriques de performance */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`px-3 py-2 rounded-lg border text-center ${getUptimeColor(machine.uptimePercentage)}`}>
            <div className="text-sm font-medium">Uptime</div>
            <div className="text-lg font-bold">{machine.uptimePercentage.toFixed(1)}%</div>
          </div>
          
          <div className={`px-3 py-2 rounded-lg border text-center ${getResponseTimeColor(machine.responseTime)}`}>
            <div className="text-sm font-medium">Latence</div>
            <div className="text-lg font-bold">
              {machine.responseTime ? `${machine.responseTime}ms` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Informations temporelles - flex-grow pour occuper l'espace disponible */}
        <div className="space-y-2 text-sm flex-grow">
          {machine.lastCheck && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Dernière vérification:</span>
              </span>
              <span className="text-gray-900 font-medium">
                {formatLastCheck(machine.lastCheck)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Ajoutée le:</span>
            <span className="text-gray-900 font-medium">
              {new Date(machine.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Actions - toujours en bas grâce à mt-auto */}
        <div className="pt-2 border-t border-gray-200 mt-auto">
          <button
            onClick={onPing}
            disabled={isPinging}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isPinging
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
            }`}
          >
            {isPinging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Test en cours...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Tester la connectivité</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineCard;