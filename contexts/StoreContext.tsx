

import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { Note, CalendarEvent, Transaction, Contact, AISettings, AIProvider, Habit, Project, Task, Goal, GoalEntry, FileItem, Message, UserProfile, BankAccount } from '../types';

// Define State
interface AppState {
  userProfile: UserProfile;
  notes: Note[];
  events: CalendarEvent[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  contacts: Contact[];
  habits: Habit[];
  habitLog: Record<string, string[]>; // Key: "YYYY-MM-DD", Value: Array of completed Habit IDs
  projects: Project[];
  tasks: Task[];
  goals: Goal[];
  files: FileItem[];
  chatHistory: Message[];
  settings: AISettings;
}

// Initial State
const initialState: AppState = {
  userProfile: {
      name: '',
      email: '',
      isLoggedIn: false
  },
  notes: [],
  events: [],
  transactions: [],
  bankAccounts: [],
  contacts: [],
  habits: [],
  habitLog: {},
  projects: [],
  tasks: [],
  goals: [],
  files: [],
  chatHistory: [],
  settings: {
    provider: 'GEMINI',
    currency: '$',
    apiKeys: {
      GEMINI: '',
      OPENAI: '',
      CLAUDE: '',
    }
  }
};

// Actions
type Action =
  | { type: 'LOGIN'; payload: { name: string, email?: string } }
  | { type: 'LOGOUT'; }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'TOGGLE_NOTE_BOOKMARK'; payload: string }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_BANK_ACCOUNT'; payload: BankAccount }
  | { type: 'UPDATE_BANK_ACCOUNT'; payload: BankAccount }
  | { type: 'TOGGLE_BANK_ACCOUNT_EXCLUSION'; payload: string }
  | { type: 'DELETE_BANK_ACCOUNT'; payload: string }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT_COMPLETION'; payload: { date: string; habitId: string } }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_GOAL_ENTRY'; payload: { goalId: string; entry: GoalEntry } }
  | { type: 'ADD_FILE'; payload: FileItem }
  | { type: 'UPDATE_FILE'; payload: FileItem }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'CLEAR_CHAT'; }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AISettings> }
  | { type: 'LOAD_DATA'; payload: AppState };

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    // Auth
    case 'LOGIN':
        return {
            ...state,
            userProfile: {
                name: action.payload.name,
                email: action.payload.email || '',
                isLoggedIn: true
            },
            chatHistory: state.chatHistory.length === 0 ? [{
                id: 'init', 
                role: 'model', 
                text: `Hello ${action.payload.name}. I am 2ndBrain. I am ready to organize your life.`, 
                timestamp: Date.now() 
            }] : state.chatHistory
        };
    case 'LOGOUT':
        return {
            ...state,
            userProfile: { ...state.userProfile, isLoggedIn: false }
        };

    // Notes
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n)
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };
    case 'TOGGLE_NOTE_BOOKMARK':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.payload ? { ...n, isBookmarked: !n.isBookmarked } : n)
      };
    
    // Events
    case 'ADD_EVENT':
      const newEvents = [...state.events, action.payload].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return { ...state, events: newEvents };
    case 'UPDATE_EVENT':
      return {
          ...state,
          events: state.events.map(e => e.id === action.payload.id ? action.payload : e)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.payload) };

    // Transactions & Banks
    case 'ADD_TRANSACTION':
      const newTransactions = [action.payload, ...state.transactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return { ...state, transactions: newTransactions };
    
    case 'ADD_BANK_ACCOUNT':
        return { ...state, bankAccounts: [...state.bankAccounts, action.payload] };
    case 'UPDATE_BANK_ACCOUNT':
        return { 
            ...state, 
            bankAccounts: state.bankAccounts.map(b => b.id === action.payload.id ? action.payload : b) 
        };
    case 'TOGGLE_BANK_ACCOUNT_EXCLUSION':
        return {
            ...state,
            bankAccounts: state.bankAccounts.map(b => b.id === action.payload ? { ...b, isExcluded: !b.isExcluded } : b)
        };
    case 'DELETE_BANK_ACCOUNT':
        return { ...state, bankAccounts: state.bankAccounts.filter(b => b.id !== action.payload) };

    // Contacts
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    case 'UPDATE_CONTACT':
      return { ...state, contacts: state.contacts.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CONTACT':
      return { ...state, contacts: state.contacts.filter(c => c.id !== action.payload) };
    
    // Habit Reducers
    case 'ADD_HABIT':
        return { ...state, habits: [...state.habits, action.payload] };
    case 'DELETE_HABIT':
        return { 
            ...state, 
            habits: state.habits.filter(h => h.id !== action.payload),
        };
    case 'TOGGLE_HABIT_COMPLETION': {
        const { date, habitId } = action.payload;
        const currentLog = state.habitLog[date] || [];
        const isCompleted = currentLog.includes(habitId);
        
        let newLog;
        if (isCompleted) {
            newLog = currentLog.filter(id => id !== habitId);
        } else {
            newLog = [...currentLog, habitId];
        }

        return {
            ...state,
            habitLog: {
                ...state.habitLog,
                [date]: newLog
            }
        };
    }

    // Project Reducers
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PROJECT':
      return { 
          ...state, 
          projects: state.projects.filter(p => p.id !== action.payload),
          tasks: state.tasks.filter(t => t.projectId !== action.payload) // Cascade delete tasks
      };
    
    // Task Reducers
    case 'ADD_TASK':
        // Ensure default status
        const newTask = {
            ...action.payload,
            status: action.payload.status || (action.payload.isCompleted ? 'DONE' : 'TODO')
        };
        return { ...state, tasks: [...state.tasks, newTask] };

    case 'UPDATE_TASK':
       let updatedTask = action.payload;
       
       // Sync Status -> isCompleted
       if (updatedTask.status === 'DONE') {
           updatedTask.isCompleted = true;
       } else if (updatedTask.status === 'TODO' || updatedTask.status === 'IN_PROGRESS') {
           updatedTask.isCompleted = false;
       }

       // Sync isCompleted -> Status (Legacy fallback)
       if (updatedTask.isCompleted && updatedTask.status !== 'DONE') {
           updatedTask.status = 'DONE';
       } else if (!updatedTask.isCompleted && updatedTask.status === 'DONE') {
           updatedTask.status = 'TODO';
       }

       // Handle Timestamp
       if (updatedTask.isCompleted && !state.tasks.find(t => t.id === updatedTask.id)?.isCompleted) {
           updatedTask.completedAt = new Date().toISOString();
       } else if (!updatedTask.isCompleted) {
           updatedTask.completedAt = undefined;
       }

      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? updatedTask : t)
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    // Goal Reducers
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'ADD_GOAL_ENTRY': {
        const { goalId, entry } = action.payload;
        return {
            ...state,
            goals: state.goals.map(g => {
                if (g.id === goalId) {
                    const updatedEntries = [...g.entries, entry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const newCurrentAmount = updatedEntries.reduce((acc, curr) => acc + curr.amount, 0);
                    return { ...g, entries: updatedEntries, currentAmount: newCurrentAmount };
                }
                return g;
            })
        };
    }

    // File Reducers
    case 'ADD_FILE':
        return { ...state, files: [...state.files, action.payload] };
    case 'UPDATE_FILE':
        return { ...state, files: state.files.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'DELETE_FILE':
        // Recursive delete filter
        const idsToDelete = new Set<string>();
        const collectIds = (id: string) => {
            idsToDelete.add(id);
            state.files.filter(f => f.parentId === id).forEach(child => collectIds(child.id));
        };
        collectIds(action.payload);
        return { ...state, files: state.files.filter(f => !idsToDelete.has(f.id)) };

    // Chat Reducers
    case 'ADD_MESSAGE':
        return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'CLEAR_CHAT':
        return { ...state, chatHistory: [initialState.chatHistory[0]] };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'LOAD_DATA':
      return { 
          ...initialState, 
          ...action.payload, 
          userProfile: action.payload.userProfile || initialState.userProfile,
          settings: { ...initialState.settings, ...(action.payload.settings || {}) },
          habitLog: action.payload.habitLog || {},
          habits: action.payload.habits || [],
          projects: action.payload.projects || [],
          tasks: action.payload.tasks || [],
          goals: action.payload.goals || [],
          bankAccounts: action.payload.bankAccounts || [],
          files: action.payload.files || [],
          chatHistory: action.payload.chatHistory && action.payload.chatHistory.length > 0 ? action.payload.chatHistory : []
      };
    default:
      return state;
  }
};

// Context
const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('monomind_db');
    if (savedData) {
      try {
        dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage on change, but only after data has been loaded to prevent overwriting
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem('monomind_db', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);