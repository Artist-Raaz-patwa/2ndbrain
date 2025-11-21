
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import NotesView from './modules/NotesView';
import CalendarView from './modules/CalendarView';
import WalletView from './modules/WalletView';
import CrmView from './modules/CrmView';
import GoalsView from './modules/GoalsView';
import FileManagerView from './modules/FileManagerView';
import SettingsView from './modules/SettingsView';
import { View } from './types';
import { StoreProvider, useStore } from './contexts/StoreContext';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("App Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-white p-4 text-center">
                    <h1 className="text-4xl font-bold mb-4 text-red-500">Something went wrong.</h1>
                    <p className="text-zinc-400 mb-8 max-w-md">
                        The application encountered an unexpected error. 
                        Please try refreshing the page or resetting your data if the issue persists.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200"
                        >
                            Refresh Page
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('monomind_db');
                                window.location.reload();
                            }}
                            className="px-6 py-2 border border-zinc-700 text-zinc-400 hover:text-white rounded hover:border-white"
                        >
                            Reset Data
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const LoginScreen: React.FC = () => {
    const { dispatch } = useStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        dispatch({ type: 'LOGIN', payload: { name, email } });
    };

    return (
        <div className="h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>

            <div className="relative z-10 w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                <div className="flex justify-center mb-6">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black font-bold text-2xl shadow-lg shadow-white/20">2B</div>
                </div>
                <h1 className="text-3xl font-light text-center text-white mb-2">Welcome to 2ndBrain</h1>
                <p className="text-zinc-400 text-center mb-8 text-sm">Your personal AI Operating System.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="How should we call you?"
                            className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-white transition-colors"
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                         <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">Email (Optional)</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="For identity..."
                            className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-white transition-colors"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all transform hover:scale-[1.02]"
                    >
                        Initialize System
                    </button>
                </form>
                <p className="text-xs text-zinc-600 text-center mt-6">
                    Data is stored locally on your device.
                </p>
            </div>
        </div>
    );
};

const MainLayout: React.FC = () => {
    const { state } = useStore();
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

    if (!state.userProfile.isLoggedIn) {
        return <LoginScreen />;
    }

    const renderView = () => {
        switch (currentView) {
          case View.DASHBOARD: return <Dashboard setView={setCurrentView} />;
          case View.NOTES: return <NotesView />;
          case View.CALENDAR: return <CalendarView />;
          case View.GOALS: return <GoalsView />;
          case View.WALLET: return <WalletView />;
          case View.CRM: return <CrmView />;
          case View.FILES: return <FileManagerView />;
          case View.SETTINGS: return <SettingsView />;
          default: return <Dashboard setView={setCurrentView} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black text-white font-sans selection:bg-zinc-700 selection:text-white overflow-hidden">
            <Sidebar currentView={currentView} setView={setCurrentView} />
            <main className="flex-1 relative bg-black overflow-hidden flex flex-col pb-16 md:pb-0">
                {renderView()}
            </main>
            <ChatInterface />
        </div>
    );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
        <StoreProvider>
            <MainLayout />
        </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;
