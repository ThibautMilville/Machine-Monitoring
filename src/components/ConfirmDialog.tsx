import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText,
  cancelText,
  confirmLabel,
  cancelLabel,
  loading = false,
}) => {
  const finalConfirmText = confirmLabel || confirmText || 'Confirmer';
  const finalCancelText = cancelLabel || cancelText || 'Annuler';

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          iconBg: 'bg-green-100',
          confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-500" />,
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
    }
  };

  const typeStyles = getTypeStyles();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Dialog - empêche la propagation du clic */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full transform animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 rounded-full ${typeStyles.iconBg}`}>
              {typeStyles.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
          </div>
          
          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{message}</p>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors border border-gray-200 disabled:opacity-50"
            >
              {finalCancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${typeStyles.confirmButton}`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Traitement...</span>
                </div>
              ) : (
                finalConfirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 