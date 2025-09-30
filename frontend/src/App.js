// FILE: src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const API_URL = 'http://localhost:8000';

function App() {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, calendar, analytics
  const [showForm, setShowForm] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'health',
    frequency: 'daily',
    start_date: format(new Date(), 'yyyy-MM-dd')
  });

  // Fetch habits on load
  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get(`${API_URL}/habits/`);
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/habits/`, formData);
      fetchHabits();
      setShowForm(false);
      setFormData({
        name: '',
        category: 'health',
        frequency: 'daily',
        start_date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error('Error creating habit:', error);
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
      alert('Check-in successful! 🎉');
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
      health: 'bg-green-100 text-green-800',
      work: 'bg-blue-100 text-blue-800',
      learning: 'bg-purple-100 text-purple-800',
      fitness: 'bg-red-100 text-red-800',
      mental_health: 'bg-pink-100 text-pink-800',
      productivity: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🏆 Habit Hero</h1>
          <p className="text-purple-100">Build better routines, stay consistent</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 py-4">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'dashboard' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'calendar' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="ml-auto px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              + New Habit
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* New Habit Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Habit</h2>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Morning meditation"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Create Habit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Habits</h2>
            {habits.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">No habits yet. Create your first habit to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map(habit => (
                  <div key={habit.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{habit.name}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(habit.category)}`}>
                          {habit.category}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>📅 Frequency: <span className="font-medium">{habit.frequency}</span></p>
                      <p>🚀 Started: <span className="font-medium">{format(new Date(habit.start_date), 'MMM dd, yyyy')}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => checkInHabit(habit.id, new Date())}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                      >
                        ✓ Check In Today
                      </button>
                      <button
                        onClick={() => handleHabitSelect(habit)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                      >
                        📊
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Calendar View</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Select a habit to view its calendar:</p>
              <div className="mt-4 space-y-2">
                {habits.map(habit => (
                  <button
                    key={habit.id}
                    onClick={() => handleHabitSelect(habit)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition"
                  >
                    <span className="font-medium">{habit.name}</span>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs ${getCategoryColor(habit.category)}`}>
                      {habit.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {view === 'analytics' && selectedHabit && analytics && (
          <div>
            <button
              onClick={() => {setView('dashboard'); setSelectedHabit(null);}}
              className="mb-4 text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Dashboard
            </button>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">{selectedHabit.name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedHabit.category)}`}>
                {selectedHabit.category}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-3xl font-bold">{analytics.streak}</div>
                <div className="text-orange-100">Day Streak</div>
              </div>

              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="text-4xl mb-2">📈</div>
                <div className="text-3xl font-bold">{analytics.success_rate}%</div>
                <div className="text-green-100">Success Rate</div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold">{analytics.total_checkins}</div>
                <div className="text-blue-100">Total Check-ins</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;