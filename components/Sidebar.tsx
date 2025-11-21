
import React from 'react';
import { View } from '../types';
import { ICONS } from '../constants';
import { useStore } from '../contexts/StoreContext';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { dispatch } = useStore();
  
  const menuItems = [
    { view: View.DASHBOARD, label: 'Home', icon: ICONS.Dashboard },
    { view: View.NOTES, label: 'Notes', icon: ICONS.Notes },
    { view: View.CALENDAR, label: 'Cal', icon: ICONS.Calendar },
    { view: View.GOALS, label: 'Goals', icon: ICONS.Goals },
    { view: View.WALLET, label: 'Wallet', icon: ICONS.Wallet },
    { view: View.CRM, label: 'CRM', icon: ICONS.CRM },
    { view: View.FILES, label: 'Files', icon: ICONS.Files },
  ];

  const handleLogout = () => {
    if (confirm("Log out of your session?")) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <>
      {/* --- DESKTOP & TABLET SIDEBAR (Hidden on Mobile) --- */}
      <div className="hidden md:flex w-20 lg:w-64 h-screen border-r border-zinc-800 bg-zinc-950 flex-col sticky top-0 z-50">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-800">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">2B</div>
          <span className="hidden lg:block ml-3 font-semibold text-lg tracking-tight">2ndBrain</span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex items-center justify-center lg:justify-start p-3 rounded-lg transition-colors duration-200 group ${
                currentView === item.view 
                  ? 'bg-white text-black' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
              title={item.label}
            >
              <item.icon className={`w-6 h-6 flex-shrink-0 ${currentView === item.view ? 'text-black' : 'text-zinc-500 group-hover:text-zinc-100'}`} />
              <span className="hidden lg:block ml-3 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-2 lg:p-4 border-t border-zinc-800 space-y-1">
          <button 
              onClick={() => setView(View.SETTINGS)}
              className={`flex items-center justify-center lg:justify-start w-full p-3 rounded-lg transition-colors duration-200 group ${
                currentView === View.SETTINGS
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
              title="Settings"
          >
              <ICONS.Settings className="w-6 h-6 text-zinc-500 group-hover:text-zinc-100 flex-shrink-0" />
              <div className="hidden lg:flex flex-col ml-3 text-left">
                  <span className="text-sm font-medium">Settings</span>
              </div>
          </button>
          <button 
              onClick={handleLogout}
              className="flex items-center justify-center lg:justify-start w-full p-3 rounded-lg transition-colors duration-200 group text-zinc-500 hover:bg-red-900/20 hover:text-red-400"
              title="Logout"
          >
              <ICONS.LogOut className="w-6 h-6 group-hover:text-red-400 flex-shrink-0" />
              <div className="hidden lg:flex flex-col ml-3 text-left">
                  <span className="text-sm font-medium">Logout</span>
              </div>
          </button>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION (Hidden on Desktop) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-800 z-50 flex justify-between items-center px-4 pb-safe">
        {/* Show only top 5 items to fit screen, put rest in settings or logic */}
        {menuItems.slice(0, 5).map((item) => (
             <button
             key={item.view}
             onClick={() => setView(item.view)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
               currentView === item.view ? 'text-white' : 'text-zinc-500'
             }`}
           >
             <item.icon className="w-6 h-6" />
             <span className="text-[10px] font-medium">{item.label}</span>
           </button>
        ))}
        <button
             onClick={() => setView(View.SETTINGS)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
               currentView === View.SETTINGS ? 'text-white' : 'text-zinc-500'
             }`}
           >
             <ICONS.Settings className="w-6 h-6" />
             <span className="text-[10px] font-medium">Settings</span>
           </button>
      </div>
    </>
  );
};

export default Sidebar;
