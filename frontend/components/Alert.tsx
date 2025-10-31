import React from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <MdCheckCircle size={20} />,
    error: <MdError size={20} />,
    warning: <MdWarning size={20} />,
    info: <MdInfo size={20} />,
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${styles[type]}`}>
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-lg opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <MdClose size={20} />
        </button>
      )}
    </div>
  );
}

