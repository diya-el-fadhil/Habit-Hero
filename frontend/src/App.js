import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:8000';

function App() {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [view, setView] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [allBadges, setAllBadges] = useState([]);
  const [habitSuggestions, setHabitSuggestions] = useState([]);
  const [motivationalQuote, setMotivationalQuote] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'health',
    frequency: 'daily',
    start_date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchHabits();
    fetchUserProfile();
    fetchAllBadges();
    fetchHabitSuggestions();
    fetchMotivationalQuote();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get(`${API_URL}/habits/`);
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/gamification/profile`);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAllBadges = async () => {
    try {
      const response = await axios.get(`${API_URL}/gamification/badges`);
      setAllBadges(response.data.badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchHabitSuggestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/suggest-habits`);
      setHabitSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchMotivationalQuote = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/motivational-quote`);
      setMotivationalQuote(response.data);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/habits/`, formData);
      fetchHabits();
      fetchHabitSuggestions();
      setShowForm(false);
      setFormData({
        name: '',
        category: 'health',
        frequency: 'daily',
        start_date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Error creating habit. Make sure the backend is running!');
    }
  };

  const createSuggestedHabit = async (suggestion) => {
    try {
      await axios.post(`${API_URL}/habits/`, {
        ...suggestion,
        start_date: format(new Date(), 'yyyy-MM-dd')
      });
      fetchHabits();
      fetchHabitSuggestions();
      alert('Habit added successfully! 🎉');
    } catch (error) {
      console.error('Error creating suggested habit:', error);
    }
  };

  const deleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await axios.delete(`${API_URL}/habits/${habitId}`);
        fetchHabits();
        if (selectedHabit?.id === habitId) {
          setSelectedHabit(null);
        }
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const checkInHabit = async (habitId, date) => {
    try {
      await axios.post(`${API_URL}/checkins/`, {
        habit_id: habitId,
        date: format(date, 'yyyy-MM-dd'),
        completed: true,
        notes: ''
      });
      
      const rewardResponse = await axios.post(`${API_URL}/gamification/award-xp/${habitId}`);
      setRewardData(rewardResponse.data);
      setShowReward(true);
      
      fetchUserProfile();
      fetchMotivationalQuote();
      
      setTimeout(() => setShowReward(false), 5000);
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const fetchAnalytics = async (habitId) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/${habitId}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    fetchAnalytics(habit.id);
    setView('analytics');
  };

  const getCategoryColor = (category) => {
    const colors = {
      health: 'bg-green-200',
      work: 'bg-blue-200',
      learning: 'bg-purple-200',
      fitness: 'bg-red-200',
      mental_health: 'bg-pink-200',
      productivity: 'bg-yellow-200'
    };
    return colors[category] || 'bg-gray-200';
  };

  const getLevelProgress = () => {
    if (!userProfile) return 0;
    const xpInCurrentLevel = userProfile.total_xp % 100;
    return (xpInCurrentLevel / 100) * 100;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Reward Popup */}
      {showReward && rewardData && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="font-bold text-xl">+{rewardData.xp_earned} XP!</div>
            {rewardData.leveled_up && (
              <div className="text-sm mt-1">🎊 Level {rewardData.level}</div>
            )}
            {rewardData.new_badges.length > 0 && (
              <div className="text-sm mt-1">🏆 New Badge!</div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white shadow-xl transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h2 className="text-2xl font-bold text-gray-800">Menu</h2>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition -ml-[13px]"
            >
              <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-600"></div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarOpen && <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Views</h3>}
          
          <div className="space-y-2">
            <button
              onClick={() => setView('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                view === 'dashboard' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl -ml-[13px]">📋</span>
              {sidebarOpen && <span>Sticky Wall</span>}
              {sidebarOpen && view === 'dashboard' && <span className="ml-auto text-sm">{habits.length}</span>}
            </button>

            <button
              onClick={() => setView('badges')}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                view === 'badges' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl -ml-[13px]">🏆</span>
              {sidebarOpen && <span>Badges</span>}
            </button>

            <button
              onClick={() => setView('calendar')}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                view === 'calendar' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl -ml-[13px]">📅</span>
              {sidebarOpen && <span>Calendar</span>}
            </button>
          </div>

          {/* Stats Section */}
          {sidebarOpen && userProfile && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Your Stats</h3>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Level</span>
                  <span className="font-bold text-purple-600 text-lg">{userProfile.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total XP</span>
                  <span className="font-bold text-blue-600">{userProfile.total_xp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best Streak</span>
                  <span className="font-bold text-orange-600">{userProfile.longest_streak} 🔥</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{userProfile.total_xp % 100}/100</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {view === 'dashboard' && 'Sticky Wall'}
              {view === 'badges' && 'Your Badges'}
              {view === 'ai-suggestions' && 'AI Suggestions'}
              {view === 'calendar' && 'Calendar'}
              {view === 'analytics' && 'Analytics'}
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-medium"
            >
              + Add New Habit
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Create Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Create New Habit</h2>
                <form onSubmit={createHabit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Habit Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Morning meditation"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="health">Health</option>
                        <option value="fitness">Fitness</option>
                        <option value="work">Work</option>
                        <option value="learning">Learning</option>
                        <option value="mental_health">Mental Health</option>
                        <option value="productivity">Productivity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition"
                    >
                      Create Habit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dashboard - Sticky Notes View */}
          {view === 'dashboard' && (
            <div>
              {motivationalQuote && (
                <div className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                  <p className="text-lg italic text-center">"{motivationalQuote.quote}"</p>
                  <p className="text-sm text-center mt-2 opacity-90">— {motivationalQuote.author}</p>
                </div>
              )}

              {habits.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No habits yet</h3>
                  <p className="text-gray-500">Create your first habit to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {habits.map(habit => (
                    <div 
                      key={habit.id} 
                      className={`${getCategoryColor(habit.category)} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 relative`}
                      style={{
                        minHeight: '200px',
                        transform: `rotate(${Math.random() * 4 - 2}deg)`
                      }}
                    >
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
                      >
                        ×
                      </button>
                      
                      <h3 className="text-lg font-bold text-gray-800 mb-3 pr-6">{habit.name}</h3>
                      
                      <div className="space-y-2 text-sm text-gray-700 mb-4">
                        <p>• {habit.category}</p>
                        <p>• {habit.frequency}</p>
                        <p>• Started: {format(new Date(habit.start_date), 'MMM dd')}</p>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <button
                          onClick={() => checkInHabit(habit.id, new Date())}
                          className="flex-1 bg-white bg-opacity-70 hover:bg-opacity-100 px-3 py-2 rounded-lg text-sm font-medium transition shadow"
                        >
                          ✓ Check In
                        </button>
                        <button
                          onClick={() => handleHabitSelect(habit)}
                          className="bg-white bg-opacity-70 hover:bg-opacity-100 px-3 py-2 rounded-lg text-sm font-medium transition shadow"
                        >
                          📊
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Card */}
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gray-200 bg-opacity-50 border-2 border-dashed border-gray-400 p-6 rounded-lg hover:bg-opacity-70 transition flex items-center justify-center"
                    style={{ minHeight: '200px' }}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">+</div>
                      <p className="text-gray-600 font-medium">Add New Habit</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Badges View */}
          {view === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBadges.map(badge => {
                const isEarned = userProfile?.badges.includes(badge.id);
                return (
                  <div 
                    key={badge.id} 
                    className={`rounded-2xl shadow-lg p-8 transition transform hover:scale-105 ${
                      isEarned 
                        ? 'bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 border-2 border-yellow-400' 
                        : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-7xl mb-4 ${isEarned ? '' : 'grayscale opacity-50'}`}>
                        {badge.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{badge.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                      <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                        isEarned ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isEarned ? '✓ Unlocked' : '🔒 Locked'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Suggestions View */}
          {view === 'ai-suggestions' && (
            <div>
              <div className="mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">🤖</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">AI-Powered Suggestions</h3>
                    <p className="text-blue-100">Personalized habits based on your goals and current routine</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habitSuggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-2 border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{suggestion.name}</h3>
                      <span className="text-3xl">💡</span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>📂 Category: <span className="font-medium">{suggestion.category}</span></p>
                      <p>📅 Frequency: <span className="font-medium">{suggestion.frequency}</span></p>
                    </div>

                    <button
                      onClick={() => createSuggestedHabit(suggestion)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition"
                    >
                      ➕ Add This Habit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {view === 'analytics' && selectedHabit && analytics && (
            <div>
              <button
                onClick={() => {setView('dashboard'); setSelectedHabit(null);}}
                className="mb-6 text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2"
              >
                ← Back to Sticky Wall
              </button>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-3xl font-bold mb-2">{selectedHabit.name}</h2>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(selectedHabit.category)}`}>
                  {selectedHabit.category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg p-8 text-white">
                  <div className="text-5xl mb-3">🔥</div>
                  <div className="text-4xl font-bold mb-1">{analytics.streak}</div>
                  <div className="text-orange-100">Day Streak</div>
                </div>

                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-8 text-white">
                  <div className="text-5xl mb-3">📈</div>
                  <div className="text-4xl font-bold mb-1">{analytics.success_rate}%</div>
                  <div className="text-green-100">Success Rate</div>
                </div>

                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg p-8 text-white">
                  <div className="text-5xl mb-3">✅</div>
                  <div className="text-4xl font-bold mb-1">{analytics.total_checkins}</div>
                  <div className="text-blue-100">Total Check-ins</div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-4">Select a habit to view calendar</h3>
              <div className="space-y-3">
                {habits.map(habit => (
                  <button
                    key={habit.id}
                    onClick={() => handleHabitSelect(habit)}
                    className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition border border-gray-200"
                  >
                    <span className="font-medium text-lg">{habit.name}</span>
                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(habit.category)}`}>
                      {habit.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;