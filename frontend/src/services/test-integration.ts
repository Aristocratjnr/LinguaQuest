// Test file to verify database integration
import { userApi, gameApi, engagementApi } from './api';

export const testDatabaseIntegration = async () => {
  console.log('Testing database integration...');
  
  try {
    // Test user creation
    console.log('1. Testing user creation...');
    const testUser = await userApi.createUser({
      nickname: 'testuser_' + Date.now(),
      avatar_url: 'https://example.com/avatar.jpg'
    });
    console.log('✅ User created:', testUser.nickname);
    
    // Test user login
    console.log('2. Testing user login...');
    await userApi.login(testUser.nickname);
    console.log('✅ User login recorded');
    
    // Test score submission
    console.log('3. Testing score submission...');
    const score = await gameApi.submitScore(testUser.nickname, {
      score: 85,
      details: { test: true }
    });
    console.log('✅ Score submitted:', score.score);
    
    // Test streak increment
    console.log('4. Testing streak increment...');
    const streak = await engagementApi.incrementStreak(testUser.nickname);
    console.log('✅ Streak incremented:', streak.streak);
    
    // Test badge award
    console.log('5. Testing badge award...');
    const badge = await engagementApi.awardBadge(
      testUser.nickname, 
      'test_badge', 
      'Test Badge', 
      'A test badge for integration testing'
    );
    console.log('✅ Badge awarded:', badge.message);
    
    // Test leaderboard
    console.log('6. Testing leaderboard...');
    const leaderboard = await gameApi.getLeaderboard(10);
    console.log('✅ Leaderboard loaded:', leaderboard.leaderboard.length, 'entries');
    
    // Test user stats
    console.log('7. Testing user stats...');
    const stats = await gameApi.getUserStats(testUser.nickname);
    console.log('✅ User stats loaded:', stats);
    
    console.log('🎉 All database integration tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error);
    return false;
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose for manual testing
  (window as any).testDatabaseIntegration = testDatabaseIntegration;
} 