
import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Goal, GoalEntry } from '../types';

// Default placeholder images for goals
const GOAL_PRESETS = [
    { title: 'New Car', url: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80' },
    { title: 'Dream Home', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80' },
    { title: 'Travel', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80' },
    { title: 'Tech Setup', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80' },
    { title: 'Emergency Fund', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80' }
];

const GoalsView: React.FC = () => {
  const { state, dispatch } = useStore();
  const currency = state.settings.currency || '$';
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  // Form States
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalImage, setNewGoalImage] = useState(GOAL_PRESETS[0].url);

  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositNote, setDepositNote] = useState('');

  // Force update for timer every minute
  const [, setTick] = useState(0);
  useEffect(() => {
      const timer = setInterval(() => setTick(t => t + 1), 60000);
      return () => clearInterval(timer);
  }, []);

  const handleAddGoal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGoalTitle || !newGoalAmount || !newGoalDeadline) return;

      const newGoal: Goal = {
          id: Date.now().toString(),
          title: newGoalTitle,
          targetAmount: Number(newGoalAmount),
          currentAmount: 0,
          deadline: newGoalDeadline,
          imageUrl: newGoalImage,
          entries: [],
          createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_GOAL', payload: newGoal });
      setIsAddModalOpen(false);
      // Reset
      setNewGoalTitle('');
      setNewGoalAmount('');
      setNewGoalDeadline('');
      setNewGoalImage(GOAL_PRESETS[0].url);
  };

  const openDepositModal = (goal: Goal) => {
      setActiveGoal(goal);
      setDepositAmount('');
      setDepositDate(new Date().toISOString().split('T')[0]);
      setDepositNote('');
      setIsDepositModalOpen(true);
  };

  const handleAddDeposit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeGoal || !depositAmount) return;

      const entry: GoalEntry = {
          id: Date.now().toString(),
          amount: Number(depositAmount),
          date: depositDate,
          note: depositNote
      };

      dispatch({ 
          type: 'ADD_GOAL_ENTRY', 
          payload: { goalId: activeGoal.id, entry } 
      });
      
      // Also optionally add to wallet transaction?
      if (confirm("Do you want to record this as an expense in your Wallet as well?")) {
          dispatch({
              type: 'ADD_TRANSACTION',
              payload: {
                  id: Date.now().toString(),
                  amount: Number(depositAmount),
                  type: 'EXPENSE',
                  category: 'Savings/Goal',
                  description: `Transfer to ${activeGoal.title}`,
                  date: depositDate
              }
          });
      }

      setIsDepositModalOpen(false);
  };

  const deleteGoal = (id: string) => {
      if (confirm("Are you sure you want to delete this goal?")) {
          dispatch({ type: 'DELETE_GOAL', payload: id });
      }
  };

  // Helper to calculate time left
  const getTimeLeft = (deadline: string) => {
      const total = Date.parse(deadline) - Date.now();
      if (total <= 0) return { days: 0, hours: 0, isExpired: true };
      
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      return { days, hours, isExpired: false };
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] relative">
        {/* Header */}
        <div className="flex-none p-6 md:p-8 border-b border-zinc-900 bg-[#09090b] flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-light tracking-tight text-white">Goals & Targets</h2>
                <p className="text-zinc-500 mt-1">Visualize your dreams and track your progress.</p>
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-colors"
            >
                + New Goal
            </button>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {state.goals.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 className="text-xl font-medium text-white">No goals set yet</h3>
                    <p className="text-zinc-500 mt-2 max-w-sm mx-auto">Start by adding a financial target you want to achieve, like a new car, a vacation, or a rainy day fund.</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {state.goals.map(goal => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const timeLeft = getTimeLeft(goal.deadline);

                    return (
                        <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-zinc-600 transition-all group shadow-lg">
                            
                            {/* Image Section */}
                            <div className="w-full md:w-2/5 h-48 md:h-auto relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent md:bg-gradient-to-r md:from-transparent md:to-zinc-900 z-10"></div>
                                <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-xs font-bold text-white tracking-wider uppercase">Target</span>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 p-6 flex flex-col relative">
                                <button 
                                    onClick={() => deleteGoal(goal.id)}
                                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-1">{goal.title}</h3>
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-mono">
                                        <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Timer */}
                                <div className="flex gap-4 mb-6">
                                    <div className="bg-black border border-zinc-800 rounded-lg p-3 text-center min-w-[80px]">
                                        <div className={`text-2xl font-bold ${timeLeft.isExpired ? 'text-red-500' : 'text-white'}`}>{timeLeft.days}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Days Left</div>
                                    </div>
                                    <div className="bg-black border border-zinc-800 rounded-lg p-3 text-center min-w-[80px]">
                                        <div className={`text-2xl font-bold ${timeLeft.isExpired ? 'text-red-500' : 'text-white'}`}>{timeLeft.hours}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Hours Left</div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mt-auto">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-300 font-medium">{currency}{goal.currentAmount.toLocaleString()}</span>
                                        <span className="text-zinc-500">of {currency}{goal.targetAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000" 
                                            style={{width: `${progress}%`}}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-xs text-zinc-500">{Math.round(progress)}% Achieved</span>
                                        <button 
                                            onClick={() => openDepositModal(goal)}
                                            className="bg-white text-black px-4 py-2 rounded text-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <span>+ Add Funds</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* MODAL: Add Goal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-6">Create New Goal</h2>
                    <form onSubmit={handleAddGoal} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Goal Title</label>
                            <input 
                                type="text" 
                                required
                                value={newGoalTitle}
                                onChange={e => setNewGoalTitle(e.target.value)}
                                placeholder="e.g., Tesla Model 3"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Target Amount ({currency})</label>
                                <input 
                                    type="number" 
                                    required
                                    value={newGoalAmount}
                                    onChange={e => setNewGoalAmount(e.target.value)}
                                    placeholder="50000"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Target Date</label>
                                <input 
                                    type="date" 
                                    required
                                    value={newGoalDeadline}
                                    onChange={e => setNewGoalDeadline(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Cover Image</label>
                             <div className="grid grid-cols-5 gap-2 mb-3">
                                 {GOAL_PRESETS.map((p, i) => (
                                     <div 
                                        key={i} 
                                        onClick={() => setNewGoalImage(p.url)}
                                        className={`aspect-square rounded cursor-pointer overflow-hidden border-2 ${newGoalImage === p.url ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                     >
                                         <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                                     </div>
                                 ))}
                             </div>
                             <input 
                                type="text" 
                                value={newGoalImage}
                                onChange={e => setNewGoalImage(e.target.value)}
                                placeholder="Or paste custom image URL..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-400 outline-none focus:border-zinc-600"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-800">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200">Create Goal</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL: Add Deposit */}
        {isDepositModalOpen && activeGoal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900">
                        <h2 className="text-xl font-bold text-white">Add Funds to {activeGoal.title}</h2>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        <form id="depositForm" onSubmit={handleAddDeposit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Amount Saved ({currency})</label>
                                <input 
                                    type="number" 
                                    required
                                    value={depositAmount}
                                    onChange={e => setDepositAmount(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-2xl font-bold text-white outline-none focus:border-green-500 placeholder-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Recorded Date</label>
                                <input 
                                    type="date" 
                                    required
                                    value={depositDate}
                                    onChange={e => setDepositDate(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Note (Optional)</label>
                                <input 
                                    type="text" 
                                    value={depositNote}
                                    onChange={e => setDepositNote(e.target.value)}
                                    placeholder="Weekly saving..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-green-500"
                                />
                            </div>
                        </form>

                        {/* History Mini View */}
                        <div className="mt-8">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Recent Activity</h4>
                            <div className="space-y-2">
                                {activeGoal.entries.length === 0 && <p className="text-zinc-600 text-sm italic">No deposits yet.</p>}
                                {activeGoal.entries.slice(0, 5).map(entry => (
                                    <div key={entry.id} className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-300">{new Date(entry.date).toLocaleDateString()}</span>
                                            {entry.note && <span className="text-[10px] text-zinc-500">{entry.note}</span>}
                                        </div>
                                        <span className="font-bold text-green-400">+{currency}{entry.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3">
                        <button onClick={() => setIsDepositModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                        <button form="depositForm" type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-500">Confirm Deposit</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default GoalsView;
