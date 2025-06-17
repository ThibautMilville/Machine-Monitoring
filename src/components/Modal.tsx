import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-7xl mx-4';
      default:
        return 'max-w-lg';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop amélioré */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={handleBackdropClick}
      />
      
      {/* Modal avec design moderne */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-2xl shadow-2xl border border-gray-200/50
          max-h-[90vh] overflow-hidden w-full ${getSizeClasses()}
          transform transition-all duration-300 ease-out
          animate-in fade-in zoom-in-95
        `}
      >
        {/* Header moderne avec dégradé subtil */}
        <div className="relative">
          {/* Dégradé de fond */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 opacity-80" />
          
          {/* Contenu du header */}
          <div className="relative flex items-center justify-between p-6 border-b border-gray-200/70">
            <div className="flex items-center space-x-3">
              {/* Icône décorative */}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 bg-white rounded-md opacity-90" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 mt-0.5">Remplissez les informations ci-dessous</p>
              </div>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content avec padding amélioré */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 