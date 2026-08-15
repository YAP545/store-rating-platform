import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info' }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        {icons[type] || icons.info}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
