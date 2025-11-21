import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { View } from '../types';

interface DashboardProps {
    setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { state } = useStore();

  const recentNotes = state.notes.slice(0, 3);
  const upcomingEvents = state.events.filter(e => new Date(e.date) >= new Date()).slice(0, 3);

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
        <h2 className="text-3xl font-light tracking-tight mb-2">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}</h2>
        <p className="text-zinc-500 mb-10">Here is your productivity overview.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Stat Cards */}
            <div onClick={() => setView(View.NOTES)} className="cursor-pointer bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:bg-zinc-800 transition-colors">
                <div className="text-zinc-500 text-sm">Notes</div>
                <div className="text-2xl font-bold text-white mt-1">{state.notes.length}</div>
            </div>
            <div onClick={() => setView(View.CALENDAR)} className="cursor-pointer bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:bg-zinc-800 transition-colors">
                <div className="text-zinc-500 text-sm">Events</div>
                <div className="text-2xl font-bold text-white mt-1">{state.events.length}</div>
            </div>
            <div onClick={() => setView(View.CRM)} className="cursor-pointer bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:bg-zinc-800 transition-colors">
                <div className="text-zinc-500 text-sm">Contacts</div>
                <div className="text-2xl font-bold text-white mt-1">{state.contacts.length}</div>
            </div>
            <div onClick={() => setView(View.WALLET)} className="cursor-pointer bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:bg-zinc-800 transition-colors">
                <div className="text-zinc-500 text-sm">Balance</div>
                <div className="text-2xl font-bold text-white mt-1">
                    ${state.transactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0)}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Notes Preview */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Recent Notes</h3>
                    <button onClick={() => setView(View.NOTES)} className="text-xs text-zinc-500 hover:text-white">View All</button>
                </div>
                <div className="space-y-3">
                    {recentNotes.length === 0 && <div className="text-zinc-600 text-sm italic">No notes found.</div>}
                    {recentNotes.map(note => (
                        <div key={note.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                            <h4 className="font-medium text-zinc-200">{note.title}</h4>
                            <p className="text-zinc-500 text-sm line-clamp-1 mt-1">{note.content}</p>
                        </div>
                    ))}
                </div>
            </div>

             {/* Upcoming Events Preview */}
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Upcoming Events</h3>
                    <button onClick={() => setView(View.CALENDAR)} className="text-xs text-zinc-500 hover:text-white">View All</button>
                </div>
                <div className="space-y-3">
                    {upcomingEvents.length === 0 && <div className="text-zinc-600 text-sm italic">No upcoming events.</div>}
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                            <div className="text-center min-w-[50px] border-r border-zinc-700 pr-3">
                                <div className="text-xs text-zinc-500">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                                <div className="font-bold text-lg">{new Date(event.date).getDate()}</div>
                            </div>
                            <div>
                                <h4 className="font-medium text-zinc-200">{event.title}</h4>
                                <div className="text-xs text-zinc-500">{event.startTime}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
