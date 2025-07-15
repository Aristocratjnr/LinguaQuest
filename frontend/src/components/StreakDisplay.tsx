import React from 'react';
import { useUser } from '../context/UserContext';
import { LocalFireDepartment as FireIcon } from '@mui/icons-material';

interface StreakDisplayProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ showLabel = true, size = 'medium' }) => {
  const { user } = useUser();

  if (!user) return null;

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return '1rem';
      case 'large':
        return '2rem';
      default:
        return '1.5rem';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.25rem';
      default:
        return '1rem';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      fontSize: getTextSize(),
    }}>
      <FireIcon 
        sx={{ 
          color: user.current_streak > 0 ? '#ff4d4d' : '#666',
          fontSize: getIconSize(),
        }} 
      />
      <span>
        {user.current_streak}
        {showLabel && ' day streak'}
      </span>
      {user.highest_streak > user.current_streak && showLabel && (
        <span style={{ color: '#666', fontSize: '0.875em' }}>
          (Best: {user.highest_streak})
        </span>
      )}
    </div>
  );
};

export default StreakDisplay;
