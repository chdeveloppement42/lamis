import { getStatusLabel, getStatusClass } from '../utils/statusUtils';

export default function StatusBadge({ status, type = 'listing', className = '' }) {
  if (!status) return null;
  
  return (
    <span className={`admin-badge ${getStatusClass(status)} ${className}`}>
      {getStatusLabel(status, type)}
    </span>
  );
}
