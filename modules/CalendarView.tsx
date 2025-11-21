

import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CalendarView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  // --- Calendar Logic ---
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
  
  // Generate calendar grid days
  const calendarDays = useMemo(() => {
      const days = [];
      // Previous month padding
      for (let i = 0; i < firstDayOfMonth; i++) {
          days.push({ date: null }); 
      }
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
          // Format: YYYY-MM-DD (local time)
          const dateStr = new Date(year, month, i).toLocaleDateString('en-CA'); // YYYY-MM-DD
          days.push({ date: dateStr, dayNum: i });
      }
      return days;
  }, [year, month]);

  // Productivity Calculation Per Day
  const getProductivity = (dateStr: string) => {
      const completed = state.habitLog[dateStr] || [];
      if (state.habits.length === 0) return 0;
      return (completed.length / state.habits.length) * 100;
  };

  // --- Handlers ---

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleAddHabit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newHabitTitle.trim()) return;
      
      dispatch({
          type: 'ADD_HABIT',
          payload: {
              id: Date.now().toString(),
              title: newHabitTitle,
              createdAt: new Date().toISOString()
          }
      });
      setNewHabitTitle('');
  };

  const toggleHabit = (habitId: string) => {
      if (!selectedDay) return;
      dispatch({
          type: 'TOGGLE_HABIT_COMPLETION',
          payload: { date: selectedDay, habitId }
      });
  };

  // --- Chart Data (Last 30 Days) ---
  const chartData = useMemo(() => {
      const data = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toLocaleDateString('en-CA');
          data.push({
              date: dateStr,
              score: getProductivity(dateStr)
          });
      }
      return data;
  }, [state.habitLog, state.habits]);


  // --- Subcomponents ---

  const DayModal = () => {
      if (!selectedDay) return null;
      
      const dayEvents = state.events.filter(e => e.date === selectedDay);
      const completedHabits = state.habitLog[selectedDay] || [];
      const productivity = getProductivity(selectedDay);

      return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
              <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="p-6 border-b border-zinc-800 bg-zinc-900">
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="text-2xl font-bold text-white">{new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                              <p className="text-zinc-500 text-sm mt-1">Focus & Productivity</p>
                          </div>
                          <div className="text-right">
                              <div className="text-3xl font-mono font-bold text-white">{Math.round(productivity)}%</div>
                              <div className="h-1 w-16 bg-zinc-800 mt-1 rounded-full overflow-hidden">
                                  <div className="h-full bg-white transition-all duration-500" style={{width: `${productivity}%`}}></div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                      {/* Habits Section */}
                      <div className="space-y-3">
                          <h4 className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-4">Daily Habits</h4>
                          {state.habits.length === 0 && (
                              <p className="text-zinc-600 text-sm italic">No habits defined yet.</p>
                          )}
                          {state.habits.map(habit => {
                              const isDone = completedHabits.includes(habit.id);
                              return (
                                  <div 
                                      key={habit.id} 
                                      onClick={() => toggleHabit(habit.id)}
                                      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer border transition-all duration-200
                                          ${isDone ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-600'}
                                      `}
                                  >
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isDone ? 'border-black bg-black' : 'border-zinc-600'}`}>
                                          {isDone && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                      </div>
                                      <span className={`font-medium ${isDone ? 'line-through' : ''}`}>{habit.title}</span>
                                  </div>
                              );
                          })}
                      </div>

                      {/* Events Section */}
                      <div className="space-y-3 pt-6 border-t border-zinc-800">
                          <h4 className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-4">Scheduled Events</h4>
                          {dayEvents.length === 0 && (
                              <p className="text-zinc-600 text-sm italic">No events scheduled.</p>
                          )}
                          {dayEvents.map(event => (
                              <div key={event.id} className="flex items-start gap-3 text-sm">
                                  <div className="min-w-[50px] font-mono text-zinc-500 pt-0.5">{event.startTime}</div>
                                  <div>
                                      <div className="text-zinc-200 font-medium">{event.title}</div>
                                      {event.description && <div className="text-zinc-500 text-xs mt-0.5">{event.description}</div>}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-zinc-800 bg-zinc-900 text-center">
                      <button onClick={() => setSelectedDay(null)} className="text-sm text-zinc-500 hover:text-white transition-colors">Close View</button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col bg-black relative overflow-y-auto md:overflow-hidden">
      {/* Modal Overlay */}
      <DayModal />

      {/* Top Area: Controls & Habits */}
      <div className="flex-none p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 border-b border-zinc-900">
          {/* Header & Month Nav */}
          <div className="lg:col-span-2 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-1">Productivity Hub</h2>
              <div className="flex items-center gap-4 mt-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors">
                      &larr;
                  </button>
                  <span className="text-lg md:text-xl font-mono font-medium w-48 text-center">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={nextMonth} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors">
                      &rarr;
                  </button>
              </div>
          </div>

          {/* Quick Habit Adder */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 md:p-5 flex flex-col justify-center">
              <form onSubmit={handleAddHabit} className="flex gap-2 mb-3">
                  <input 
                      type="text" 
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                      placeholder="New habit..." 
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
                  />
                  <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">+</button>
              </form>
              <div className="flex flex-wrap gap-2">
                  {state.habits.map(h => (
                      <div key={h.id} className="group flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 text-xs text-zinc-300">
                          {h.title}
                          <button onClick={() => dispatch({type:'DELETE_HABIT', payload: h.id})} className="hidden group-hover:block text-zinc-500 hover:text-red-400">&times;</button>
                      </div>
                  ))}
                  {state.habits.length === 0 && <span className="text-zinc-600 text-xs">No habits tracked. Add one above.</span>}
              </div>
          </div>
      </div>

      {/* Main Content: Calendar Grid & Graph */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Calendar Grid */}
          <div className="flex-1 p-2 md:p-8 overflow-y-auto min-h-[350px]">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-2 md:mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-center text-[10px] md:text-xs font-bold text-zinc-600 tracking-wider">{day}</div>
                  ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1 md:gap-4 auto-rows-fr md:h-[500px]">
                  {calendarDays.map((item, idx) => {
                      if (!item.date) return <div key={idx} className="bg-transparent"></div>;
                      
                      const productivity = getProductivity(item.date);
                      const isToday = item.date === new Date().toLocaleDateString('en-CA');
                      
                      return (
                          <div 
                              key={idx} 
                              onClick={() => setSelectedDay(item.date)}
                              className={`relative group rounded-md md:rounded-lg cursor-pointer border border-zinc-800/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10
                                  ${isToday ? 'ring-1 md:ring-2 ring-white ring-offset-1 md:ring-offset-2 ring-offset-black' : ''}
                                  aspect-square md:aspect-auto min-h-[40px] md:min-h-0
                              `}
                              style={{
                                  backgroundColor: '#09090b', 
                              }}
                          >
                              {/* The White Overlay for Grayscale effect */}
                              <div className="absolute inset-0 rounded-md md:rounded-lg transition-opacity duration-500"
                                   style={{
                                       backgroundColor: '#ffffff',
                                       opacity: productivity / 100
                                   }}
                              ></div>

                              {/* Content */}
                              <div className="relative z-10 p-1 md:p-2 h-full flex flex-col justify-between pointer-events-none">
                                  <span className={`text-[10px] md:text-sm font-medium ${productivity > 50 ? 'text-black' : 'text-zinc-400 group-hover:text-white'}`}>
                                      {item.dayNum}
                                  </span>
                                  
                                  {/* Mini Dots for Events */}
                                  <div className="flex gap-0.5 justify-end flex-wrap">
                                      {state.events.filter(e => e.date === item.date).map((_, i) => (
                                          <div key={i} className={`w-0.5 h-0.5 md:w-1 md:h-1 rounded-full ${productivity > 50 ? 'bg-black/50' : 'bg-white/50'}`}></div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* Right Sidebar: Productivity Graph (Desktop) or Bottom (Mobile) */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-900 bg-zinc-950 p-6 flex flex-col flex-none min-h-[250px]">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6">30-Day Trend</h3>
              
              <div className="h-48 lg:flex-1 min-h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            hide={true} 
                          />
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                              itemStyle={{ color: '#fff' }}
                              formatter={(value: number) => [`${Math.round(value)}%`, 'Productivity']}
                              labelFormatter={() => ''}
                          />
                          <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#ffffff" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorScore)" 
                          />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>

              <div className="mt-6 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                      <span>MONTHLY AVERAGE</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                      {Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / (chartData.length || 1))}%
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CalendarView;