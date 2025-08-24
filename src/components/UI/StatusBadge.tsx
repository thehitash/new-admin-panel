import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  
  const statusConfig = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return (
    <span className={`${baseClasses} ${sizeClasses} ${statusConfig[status]}`}>
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;