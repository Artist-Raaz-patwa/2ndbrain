

import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { BankAccount, BankAccountType } from '../types';

// Helper component for Credit Card Visualization
const BankCard: React.FC<{ 
    account: BankAccount, 
    onClick: () => void, 
    onDelete: () => void,
    onToggleExclusion: () => void
}> = ({ account, onClick, onDelete, onToggleExclusion }) => {
    
    // Dynamic gradient based on stored theme or fallback
    const getGradient = () => {
        const theme = account.colorTheme;
        if (theme === 'GOLD') return 'bg-gradient-to-br from-yellow-600 via-yellow-400 to-yellow-200 text-black';
        if (theme === 'PLATINUM') return 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400 text-black';
        if (theme === 'BLACK') return 'bg-gradient-to-br from-gray-900 to-black text-white border border-zinc-700';
        if (theme.startsWith('#')) return `bg-[${theme}]`; 
        
        // Default Gradients
        switch(account.type) {
            case 'CREDIT': return 'bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 text-white';
            case 'SAVINGS': return 'bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-700 text-white';
            case 'INVESTMENT': return 'bg-gradient-to-br from-indigo-800 to-indigo-950 border border-indigo-700 text-white';
            default: return 'bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 text-white';
        }
    };

    const gradientClass = getGradient();
    const isHex = account.colorTheme.startsWith('#');

    return (
        <div 
            onClick={onClick}
            className={`relative w-80 h-48 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all hover:scale-105 cursor-pointer flex-shrink-0 overflow-hidden group 
                ${!isHex ? gradientClass : 'text-white'}
                ${account.isExcluded ? 'opacity-50 grayscale' : 'opacity-100'}
            `}
            style={isHex ? { backgroundColor: account.colorTheme, backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)' } : {}}
        >
            {/* Card Actions (Hidden until hover) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleExclusion(); }}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all"
                    title={account.isExcluded ? "Include in Net Worth" : "Exclude from Net Worth"}
                >
                    {account.isExcluded ? (
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-red-500/80 text-white/70 hover:text-white transition-all"
                    title="Delete Card"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Top Row: Bank Name & Type */}
            <div className="flex justify-between items-start">
                <span className="font-bold tracking-wider text-lg opacity-90">{account.bankName}</span>
                <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-mono border border-current px-1.5 py-0.5 rounded opacity-70 uppercase">{account.type}</span>
                     {account.isExcluded && <span className="text-[9px] bg-black/50 px-1 rounded text-white font-bold uppercase">Hidden</span>}
                </div>
            </div>

            {/* Middle: Chip & Balance */}
            <div className="flex items-center gap-4 mt-2">
                <div className="w-10 h-8 bg-gradient-to-tr from-yellow-200 to-yellow-500 rounded-md opacity-80 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-black/20"></div>
                </div>
                {/* Wireless Icon */}
                <svg className="w-6 h-6 opacity-60 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </div>

            {/* Bottom: Number & Holder */}
            <div className="mt-auto">
                <div className="text-2xl font-mono tracking-widest mb-4 flex gap-3 opacity-90 text-shadow">
                    <span>••••</span><span>••••</span><span>••••</span><span>{account.accountNumberLast4 || '0000'}</span>
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                         <span className="text-[8px] uppercase opacity-70 mb-0.5">Account Holder</span>
                         <span className="text-sm font-medium uppercase tracking-wide">{account.accountName}</span>
                    </div>
                    <div className="text-xl font-bold">
                         {account.currency}{account.balance.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const WalletView: React.FC = () => {
  const { state, dispatch } = useStore();
  const currency = state.settings.currency || '$';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trendRange, setTrendRange] = useState<'1W' | '1M' | '6M' | '1Y'>('1M');

  // Form State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<BankAccountType>('CHECKING');
  const [balance, setBalance] = useState('');
  const [last4, setLast4] = useState('');
  const [colorTheme, setColorTheme] = useState('#18181b');

  // --- Calculations ---
  
  // Filter excluded accounts for Net Worth
  const activeAccounts = state.bankAccounts.filter(a => !a.isExcluded);

  const totalAssets = activeAccounts
    .filter(a => a.type !== 'CREDIT')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = activeAccounts
    .filter(a => a.type === 'CREDIT')
    .reduce((sum, a) => sum + a.balance, 0); // Assuming credit card balance is debt

  const netWorth = totalAssets - totalLiabilities;

  const income = state.transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expenses = state.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

  // Cash Flow Chart Data
  const cashFlowData = state.transactions.slice(0, 10).reverse().map(t => ({
    name: t.category,
    amount: t.type === 'INCOME' ? t.amount : -t.amount,
    type: t.type
  }));

  // --- TREND DATA GENERATION ---
  const trendData = useMemo(() => {
      const daysMap: {[key: string]: number} = { '1W': 7, '1M': 30, '6M': 180, '1Y': 365 };
      const daysToLookBack = daysMap[trendRange];
      const result = [];
      
      // 1. Get Sorted Transactions (Newest First)
      const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // 2. Current Pointer
      let currentPseudoBalance = netWorth; 
      
      // 3. Iterate backwards day by day
      const today = new Date();
      today.setHours(0,0,0,0);

      for (let i = 0; i <= daysToLookBack; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() - i);
          const targetDateStr = targetDate.toISOString().split('T')[0];
          
          // Find transactions that happened AFTER this target date (between targetDate and targetDate + 1 day essentially, 
          // but since we are moving backwards, we subtract transactions that happened on the day "i" from the running balance 
          // to get the balance at the START of day "i" or END of day "i-1")
          
          // Wait, correct logic: 
          // Balance(Day T) is known. 
          // Balance(Day T-1) = Balance(Day T) - Income(Day T) + Expense(Day T).
          
          // Let's collect transactions for this specific day we are currently processing (Day T-i)
          // Note: Since we start loop at i=0 (Today), we push current balance.
          // Then we adjust balance for the NEXT iteration (Yesterday).
          
          result.push({
              date: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              balance: currentPseudoBalance
          });

          // Adjust for the transactions on this day to prepare for "Yesterday"
          const txsOnThisDay = sortedTx.filter(t => t.date.startsWith(targetDateStr));
          
          // If we earned money today, yesterday we had LESS. So subtract Income.
          // If we spent money today, yesterday we had MORE. So add Expense.
          const daysIncome = txsOnThisDay.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
          const daysExpense = txsOnThisDay.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
          
          currentPseudoBalance = currentPseudoBalance - daysIncome + daysExpense;
      }

      return result.reverse();
  }, [netWorth, state.transactions, trendRange]);


  // Handlers
  const handleAddAccount = (e: React.FormEvent) => {
      e.preventDefault();
      const newAccount: BankAccount = {
          id: Date.now().toString(),
          bankName,
          accountName: accountName || bankName,
          type: accountType,
          balance: Number(balance),
          accountNumberLast4: last4 || '0000',
          colorTheme,
          currency,
          isExcluded: false
      };
      dispatch({ type: 'ADD_BANK_ACCOUNT', payload: newAccount });
      setIsModalOpen(false);
      // Reset
      setBankName(''); setAccountName(''); setBalance(''); setLast4('');
  };

  const handleDeleteAccount = (id: string) => {
      if(confirm("Remove this account? History will remain, but the card will be deleted.")) {
          dispatch({ type: 'DELETE_BANK_ACCOUNT', payload: id });
      }
  };
  
  const handleToggleExclusion = (id: string) => {
      dispatch({ type: 'TOGGLE_BANK_ACCOUNT_EXCLUSION', payload: id });
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] overflow-hidden">
      {/* Header & Net Worth */}
      <div className="flex-none p-6 md:p-8 border-b border-zinc-900 bg-[#09090b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Digital Wallet</h2>
          <div className="flex items-baseline gap-2 mt-1">
              <span className="text-zinc-500 text-sm uppercase font-bold tracking-wider">Net Worth</span>
              <span className={`text-2xl font-mono font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currency}{netWorth.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-600 ml-2">
                 (Active Accounts)
              </span>
          </div>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors text-sm flex items-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Card
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {/* CARDS CAROUSEL */}
          <div className="mb-10">
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory custom-scrollbar">
                  {/* Add Card Button (Inline) */}
                  <div 
                    onClick={() => setIsModalOpen(true)}
                    className="min-w-[60px] w-16 rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer flex items-center justify-center transition-all flex-shrink-0 h-48"
                  >
                      <span className="text-2xl text-zinc-500">+</span>
                  </div>

                  {state.bankAccounts.length === 0 && (
                      <div className="flex flex-col justify-center px-4 min-w-[200px]">
                          <p className="text-zinc-500 text-sm">No cards added yet.</p>
                          <p className="text-zinc-600 text-xs">Add your bank accounts to track balances.</p>
                      </div>
                  )}

                  {state.bankAccounts.map(acc => (
                      <div key={acc.id} className="snap-center">
                          <BankCard 
                            account={acc} 
                            onClick={() => {}} // Future: Open detail view
                            onDelete={() => handleDeleteAccount(acc.id)}
                            onToggleExclusion={() => handleToggleExclusion(acc.id)}
                          />
                      </div>
                  ))}
              </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
             
             {/* TREND CHART */}
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Net Worth Trend</h3>
                     <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                         {(['1W', '1M', '6M', '1Y'] as const).map(range => (
                             <button 
                                key={range}
                                onClick={() => setTrendRange(range)}
                                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${trendRange === range ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                             >
                                 {range}
                             </button>
                         ))}
                     </div>
                 </div>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                                formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Balance']}
                            />
                            <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* CASH FLOW & STATS */}
             <div className="flex flex-col gap-6">
                 <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                     <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">Recent Cash Flow</h3>
                     <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cashFlowData}>
                                <XAxis dataKey="name" hide />
                                <Tooltip 
                                    cursor={{fill: '#27272a', opacity: 0.4}}
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                                />
                                <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                                    {cashFlowData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.type === 'INCOME' ? '#34d399' : '#fb7185'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-center">
                        <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Income</div>
                        <div className="text-lg font-bold text-emerald-400">+{currency}{income.toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-center">
                        <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Expenses</div>
                        <div className="text-lg font-bold text-rose-400">-{currency}{expenses.toLocaleString()}</div>
                    </div>
                 </div>
             </div>

          </div>

          {/* RECENT TRANSACTIONS LIST */}
          <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-light">Recent Transactions</h3>
                  <button className="text-xs text-zinc-500 hover:text-white">See All</button>
              </div>
              <div className="space-y-1">
                {state.transactions.length === 0 && <div className="text-zinc-600 text-sm">No transactions recorded.</div>}
                {state.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-lg hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-900/20 text-emerald-500' : 'bg-rose-900/20 text-rose-500'}`}>
                          {t.type === 'INCOME' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          )}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200">{t.category}</div>
                        <div className="text-xs text-zinc-500">{t.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{currency}{t.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-600">{new Date(t.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
      </div>

      {/* MODAL: ADD ACCOUNT */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
                  <div className="p-6 border-b border-zinc-800">
                      <h2 className="text-xl font-bold text-white">Add New Card</h2>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <form id="addBankForm" onSubmit={handleAddAccount} className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Bank Name</label>
                              <input type="text" required value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Chase" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Card Nickname</label>
                              <input type="text" required value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="e.g. Sapphire Reserve" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Type</label>
                                  <select value={accountType} onChange={e => setAccountType(e.target.value as BankAccountType)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500">
                                      <option value="CHECKING">Checking</option>
                                      <option value="SAVINGS">Savings</option>
                                      <option value="CREDIT">Credit Card</option>
                                      <option value="INVESTMENT">Investment</option>
                                      <option value="CASH">Cash</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Last 4 Digits</label>
                                  <input type="text" maxLength={4} value={last4} onChange={e => setLast4(e.target.value)} placeholder="1234" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500 font-mono" />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Current Balance ({currency})</label>
                              <input type="number" required value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
                          </div>
                          
                          <div>
                              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Card Theme</label>
                              <div className="flex gap-2 flex-wrap">
                                  {['#18181b', '#1e40af', '#047857', '#b91c1c', '#7c3aed', '#ea580c', 'GOLD', 'PLATINUM', 'BLACK'].map(c => (
                                      <div 
                                        key={c} 
                                        onClick={() => setColorTheme(c)}
                                        className={`w-8 h-8 rounded-full cursor-pointer border-2 flex items-center justify-center text-[8px] text-zinc-400 ${colorTheme === c ? 'border-white' : 'border-transparent'}`}
                                        style={c.startsWith('#') ? {backgroundColor: c} : {background: '#333'}}
                                      >
                                          {!c.startsWith('#') && c[0]}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </form>
                  </div>
                  <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                      <button form="addBankForm" type="submit" className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200">Add Card</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default WalletView;