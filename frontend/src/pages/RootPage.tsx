import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSettings } from '../context/SettingsContext';

// Import all components that will be routed
import WelcomePage from '../components/WelcomePage';
import LanguageSelector from '../components/LanguageSelector';
import NicknamePrompt from '../components/NicknamePrompt';
import AvatarPicker from '../components/AvatarPicker';
import Age from '../components/Age';
import Engagement from '../components/Engagement';
import CategorySelector from '../components/CategorySelector';
import LoginPage from '../components/LoginPage';
import SettingsPage from '../components/SettingsPage';
import Leaderboard from '../components/Leaderboard';
import Dashboard from '../components/Dashboard';

const RootPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginUser } = useUser();
  const { nickname, avatar, setNickname, setAvatar } = useSettings();
  
  // States for onboarding flow
  const [language, setLanguage] = useState('twi');
  const [category, setCategory] = useState('food');
  const [difficulty, setDifficulty] = useState('easy');
  const [ageError, setAgeError] = useState<string | null>(null);

  // Handle nickname confirm
  const handleNicknameConfirm = (name: string) => {
    setNickname(name);
    navigate('/onboarding/avatar');
  };

  // Handle avatar confirm
  const handleAvatarConfirm = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    navigate('/onboarding/age');
  };

  // Handle age confirm and login
  const handleAgeConfirm = async (age: number) => {
    if (isNaN(age) || age < 13 || age > 120) {
      setAgeError('Please enter a valid age between 13 and 120.');
      return;
    }
    setAgeError(null);
    
    // Record login in backend after nickname is set
    if (nickname) {
      try {
        await loginUser(nickname);
        navigate('/onboarding/engagement');
      } catch (err) {
        console.error('Failed to record login:', err);
        // Still proceed to engagement even if login fails
        navigate('/onboarding/engagement');
      }
    }
  };

  // Handle engagement start
  const handleEngagementStart = () => {
    navigate('/onboarding/category');
  };

  // Handle category confirm
  const handleCategoryConfirm = async (cat: string, diff: string) => {
    console.log('RootPage: CategorySelector confirmed:', cat, diff);
    console.log('RootPage: Current user:', user);
    
    // Navigate to dashboard with URL parameters
    navigate(`/dashboard?category=${cat}&difficulty=${diff}&language=${language}`);
  };

  return (
    <>
      <Routes>
        {/* Welcome and Onboarding Routes */}
        <Route path="/" element={
          <WelcomePage onGetStarted={() => navigate('/onboarding/language')} />
        } />
        
        <Route path="/onboarding/language" element={
          <LanguageSelector
            onSelect={(lang) => {
              setLanguage(lang);
              navigate('/onboarding/nickname');
            }}
            onBack={() => navigate('/')}
          />
        } />
        
        <Route path="/onboarding/nickname" element={
          <NicknamePrompt onConfirm={handleNicknameConfirm} />
        } />
        
        <Route path="/onboarding/avatar" element={
          <AvatarPicker onConfirm={handleAvatarConfirm} />
        } />
        
        <Route path="/onboarding/age" element={
          <Age onConfirm={handleAgeConfirm} />
        } />
        
        <Route path="/onboarding/engagement" element={
          <Engagement
            nickname={nickname}
            avatar={avatar}
            onStart={handleEngagementStart}
          />
        } />
        
        <Route path="/onboarding/category" element={
          <CategorySelector onConfirm={handleCategoryConfirm} />
        } />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Settings Route */}
        <Route path="/settings" element={
          <SettingsPage onClose={() => navigate('/')} />
        } />
        
        {/* Debug Route */}
        <Route path="/debug" element={
          <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>Debug Info</h2>
            <p>User: {user ? user.nickname : 'Not logged in'}</p>
            <p>Category: {category || 'Not set'}</p>
            <p>Difficulty: {difficulty || 'Not set'}</p>
            <p>Language: {language || 'Not set'}</p>
            <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            <button onClick={() => navigate('/onboarding/category')}>Go to Category Selector</button>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        } />
        
        {/* Main Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app" element={<Dashboard />} /> {/* Alias for backward compatibility */}
      </Routes>
    </>
  );
};

export default RootPage;
