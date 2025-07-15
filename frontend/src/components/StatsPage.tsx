import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import StreakDisplay from './StreakDisplay';
import {
  EmojiEvents as TrophyIcon,
  Timeline as HistoryIcon,
  Grade as StarIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

const StatsPage: React.FC = () => {
  const { user, userStats } = useUser();

  if (!user || !userStats) return null;

  const statCards = [
    {
      title: 'Current Streak',
      value: user.current_streak,
      icon: <StreakDisplay showLabel={false} size="large" />,
      color: '#ff4d4d',
      description: `${user.highest_streak > user.current_streak ? `Best: ${user.highest_streak} days` : 'Keep it up!'}`
    },
    {
      title: 'Total Score',
      value: userStats.total_score,
      icon: <TrophyIcon />,
      color: '#ffc107',
      description: 'Points earned'
    },
    {
      title: 'Games Played',
      value: userStats.games_played,
      icon: <HistoryIcon />,
      color: '#2196f3',
      description: `Avg. score: ${Math.round(userStats.average_score)}`
    },
    {
      title: 'Highest Score',
      value: userStats.highest_score,
      icon: <StarIcon />,
      color: '#ff9800',
      description: 'Personal best'
    },
    {
      title: 'Total Rounds',
      value: userStats.total_rounds_played,
      icon: <SpeedIcon />,
      color: '#4caf50',
      description: 'Conversation rounds'
    },
    {
      title: 'Badges Earned',
      value: userStats.badges_count,
      icon: <StarIcon />,
      color: '#9c27b0',
      description: 'Achievements unlocked'
    }
  ];

  return (
    <div className="container py-4">
      <h1 className="mb-4">Your Progress</h1>
      
      <div className="row g-4">
        {statCards.map((stat, index) => (
          <div key={stat.title} className="col-12 col-md-6 col-lg-4">
            <motion.div
              className="card h-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle mb-1 text-muted">
                      {stat.title}
                    </h6>
                    <h2 className="card-title h4 mb-0">
                      {typeof stat.value === 'number' 
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </h2>
                  </div>
                </div>
                <p className="card-text text-muted small">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPage;
