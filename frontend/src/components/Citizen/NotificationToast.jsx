// NotificationToast.jsx
import React, { useEffect } from 'react';

const typeStyles = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-indigo-600',
};

const NotificationToast = ({ message, onClose, type = 'info', duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white flex items-center gap-2 z-50 ${typeStyles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">&times;</button>
    </div>
  );
};

export default NotificationToast; 