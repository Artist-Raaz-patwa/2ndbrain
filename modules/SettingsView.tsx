
import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { AIProvider } from '../types';

const CURRENCY_OPTIONS = [
    { symbol: '$', label: 'USD ($)' },
    { symbol: '€', label: 'EUR (€)' },
    { symbol: '£', label: 'GBP (£)' },
    { symbol: '¥', label: 'JPY (¥)' },
    { symbol: '₹', label: 'INR (₹)' },
    { symbol: 'CAD$', label: 'CAD ($)' },
    { symbol: 'AUD$', label: 'AUD ($)' },
];

const SettingsView: React.FC = () => {
  const { state, dispatch } = useStore();
  
  // Local state for inputs
  const [provider, setProvider] = useState<AIProvider>(state.settings.provider);
  const [apiKeys, setApiKeys] = useState(state.settings.apiKeys);
  const [currency, setCurrency] = useState(state.settings.currency || '$');
  const [userName, setUserName] = useState(state.userProfile.name);
  const [userEmail, setUserEmail] = useState(state.userProfile.email || '');
  
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Trim keys before saving
    const trimmedKeys = {
        GEMINI: apiKeys.GEMINI.trim(),
        OPENAI: apiKeys.OPENAI.trim(),
        CLAUDE: apiKeys.CLAUDE.trim(),
    };

    dispatch({
        type: 'UPDATE_SETTINGS',
        payload: {
            provider,
            currency,
            apiKeys: trimmedKeys
        }
    });
    
    // Update Profile via Login action (acts as update here)
    dispatch({
        type: 'LOGIN',
        payload: {
            name: userName,
            email: userEmail
        }
    });

    setApiKeys(trimmedKeys); 
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-light tracking-tight">Settings</h2>
      </div>

      <div className="max-w-2xl space-y-8">
        
        {/* User Profile */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4">Personal Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Display Name</label>
                    <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                    <input 
                        type="email" 
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none"
                    />
                </div>
            </div>
        </div>

        {/* Preferences */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4">Preferences</h3>
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Preferred Currency</label>
                <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none"
                >
                    {CURRENCY_OPTIONS.map(opt => (
                        <option key={opt.symbol} value={opt.symbol}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* AI Provider Section */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4">AI Configuration</h3>
            <p className="text-zinc-500 text-sm mb-6">
                Select your preferred AI provider. Google Gemini is the recommended default.
            </p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">AI Provider</label>
                    <select 
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as AIProvider)}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none transition-colors"
                    >
                        <option value="GEMINI">Google Gemini (Recommended)</option>
                        <option value="OPENAI">OpenAI (GPT-4) [Legacy]</option>
                        <option value="CLAUDE">Anthropic (Claude) [Legacy]</option>
                    </select>
                </div>

                {provider === 'GEMINI' ? (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
                        <p>✅ <strong>Google Gemini is active.</strong></p>
                        <p className="mt-1 opacity-70">Your API key is securely managed via environment variables.</p>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            {provider === 'OPENAI' ? 'OpenAI API Key' : 'Anthropic API Key'}
                        </label>
                        <input 
                            type="password" 
                            value={apiKeys[provider]}
                            onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                            placeholder="sk-..."
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none transition-colors font-mono"
                        />
                        <div className="mt-2 text-xs text-zinc-500">
                            {provider === 'OPENAI' && (
                                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Get OpenAI API Key &rarr;</a>
                            )}
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleSave}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                        saved 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                >
                    {saved ? 'Settings Saved' : 'Save Changes'}
                </button>
            </div>
        </div>

        {/* Data Management */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl opacity-75 hover:opacity-100 transition-opacity">
             <h3 className="text-lg font-medium mb-4 text-zinc-400">Data Management</h3>
             <div className="flex flex-wrap gap-4">
                 <button 
                    onClick={() => {
                        if(confirm('Log out of your session?')) {
                            dispatch({ type: 'LOGOUT' });
                        }
                    }}
                    className="px-6 py-2 bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                 >
                    Log Out
                 </button>

                 <button 
                    onClick={() => {
                        if(confirm('Are you sure you want to reset all application data? This cannot be undone.')) {
                            localStorage.removeItem('monomind_db');
                            window.location.reload();
                        }
                    }}
                    className="px-6 py-2 border border-red-900/50 text-red-500 hover:bg-red-900/10 rounded-lg text-sm transition-colors"
                 >
                    Reset All Data
                 </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
