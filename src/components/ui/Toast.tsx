import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
    }
  }, [isVisible]);
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'error': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'info': return 'bg-blue-500/20 border-blue-500 text-blue-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`}>
      <div className={`flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-sm ${getColors()}`}>
        {getIcon()}
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}
          className="ml-2 hover:opacity-70 transition-opacity duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;