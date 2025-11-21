
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { Message, TaskStatus, BankAccountType } from '../types';
import { geminiService } from '../services/gemini';
import { useStore } from '../contexts/StoreContext';

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { state, dispatch } = useStore();
  const messages = state.chatHistory;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Safe environment check
  const isGeminiReady = typeof process !== 'undefined' && process.env && process.env.API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  // Helper: Find ID by loose title match
  const findByName = <T extends { id: string, title?: string, name?: string }>(
      collection: T[], 
      query: string
  ): T | undefined => {
      const q = query.toLowerCase();
      // Exact match first
      let found = collection.find(item => (item.title || item.name || '').toLowerCase() === q);
      if (!found) {
          // Partial match
          found = collection.find(item => (item.title || item.name || '').toLowerCase().includes(q));
      }
      return found;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    setInput('');
    setIsLoading(true);

    const { provider } = state.settings;

    if (provider !== 'GEMINI') {
        setTimeout(() => {
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    id: Date.now().toString(),
                    role: 'model',
                    text: `Please switch to Google Gemini in Settings to use full AI capabilities.`,
                    timestamp: Date.now(),
                    isError: true
                }
            });
            setIsLoading(false);
        }, 500);
        return;
    }

    try {
        const handleToolCall = async (name: string, args: any) => {
            const id = Date.now().toString();
            
            switch(name) {
                // --- CREATION ---
                case 'addNote':
                    dispatch({ 
                        type: 'ADD_NOTE', 
                        payload: { 
                            id, createdAt: new Date().toISOString(), 
                            title: args.title || "Untitled", 
                            content: args.content || "", 
                            tags: args.tags || [] 
                        } 
                    });
                    return "Note created.";

                case 'addEvent':
                    dispatch({ 
                        type: 'ADD_EVENT', 
                        payload: { 
                            id, title: args.title, date: args.date, 
                            startTime: args.startTime, durationMinutes: Number(args.durationMinutes) || 60, 
                            description: args.description 
                        } 
                    });
                    return "Event scheduled.";

                case 'addHabit':
                    dispatch({ type: 'ADD_HABIT', payload: { id, title: args.title, createdAt: new Date().toISOString() } });
                    return "Habit added.";

                case 'addTransaction':
                    dispatch({ 
                        type: 'ADD_TRANSACTION', 
                        payload: { 
                            id, date: new Date().toISOString(), amount: Number(args.amount), 
                            type: args.type, category: args.category, description: args.description 
                        } 
                    });
                    return "Transaction recorded.";

                case 'addBankAccount': {
                    const colors = ['#1e40af', '#047857', '#b91c1c', '#7c3aed', '#000000', '#374151'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    dispatch({
                        type: 'ADD_BANK_ACCOUNT',
                        payload: {
                            id,
                            bankName: args.bankName,
                            accountName: args.accountName || args.bankName,
                            type: args.type as BankAccountType,
                            balance: Number(args.balance),
                            accountNumberLast4: args.last4 || "0000",
                            colorTheme: randomColor,
                            currency: state.settings.currency || "$"
                        }
                    });
                    return `Added ${args.bankName} account.`;
                }

                case 'addContact':
                    dispatch({ type: 'ADD_CONTACT', payload: { id, name: args.name, email: args.email, company: args.company, status: args.status } });
                    return "Contact added.";

                case 'addProject':
                    dispatch({
                        type: 'ADD_PROJECT',
                        payload: {
                            id, title: args.title, clientName: args.clientName || "", 
                            budget: Number(args.budget) || 0, deadline: args.deadline || "", 
                            description: args.description || "", status: 'NOT_STARTED', createdAt: new Date().toISOString()
                        }
                    });
                    return "Project created.";

                case 'addTaskToProject': {
                    const project = findByName(state.projects, args.projectTitle);
                    if (!project) return `Error: Project "${args.projectTitle}" not found.`;
                    dispatch({
                        type: 'ADD_TASK',
                        payload: {
                            id, projectId: project.id, title: args.taskTitle, 
                            isCompleted: false, status: 'TODO', subtasks: [], amount: Number(args.amount)
                        }
                    });
                    return "Task added.";
                }

                // --- UPDATES & DELETES ---

                case 'updateNote': {
                    const note = findByName(state.notes, args.currentTitle);
                    if (!note) return `Error: Note "${args.currentTitle}" not found.`;
                    
                    let newContent = note.content;
                    if (args.replaceContent) newContent = args.replaceContent;
                    else if (args.appendContent) newContent += `\n${args.appendContent}`;

                    dispatch({
                        type: 'UPDATE_NOTE',
                        payload: {
                            ...note,
                            title: args.newTitle || note.title,
                            content: newContent
                        }
                    });
                    return "Note updated.";
                }

                case 'deleteNote': {
                    const note = findByName(state.notes, args.title);
                    if (!note) return `Error: Note "${args.title}" not found.`;
                    dispatch({ type: 'DELETE_NOTE', payload: note.id });
                    return "Note deleted.";
                }

                case 'updateEvent': {
                    const event = findByName(state.events, args.currentTitle);
                    if (!event) return `Error: Event "${args.currentTitle}" not found.`;
                    dispatch({
                        type: 'UPDATE_EVENT',
                        payload: {
                            ...event,
                            title: args.newTitle || event.title,
                            date: args.newDate || event.date,
                            startTime: args.newTime || event.startTime
                        }
                    });
                    return "Event updated.";
                }

                case 'deleteEvent': {
                    const event = findByName(state.events, args.title);
                    if (!event) return `Error: Event "${args.title}" not found.`;
                    dispatch({ type: 'DELETE_EVENT', payload: event.id });
                    return "Event removed.";
                }

                case 'updateTask': {
                    const task = findByName(state.tasks, args.taskTitle);
                    if (!task) return `Error: Task "${args.taskTitle}" not found.`;
                    
                    const updates: any = { ...task };
                    if (args.newTitle) updates.title = args.newTitle;
                    if (args.newStatus) updates.status = args.newStatus as TaskStatus;
                    if (args.markCompleted !== undefined) updates.isCompleted = args.markCompleted;

                    dispatch({ type: 'UPDATE_TASK', payload: updates });
                    return "Task updated.";
                }

                case 'deleteTask': {
                    const task = findByName(state.tasks, args.taskTitle);
                    if (!task) return `Error: Task "${args.taskTitle}" not found.`;
                    dispatch({ type: 'DELETE_TASK', payload: task.id });
                    return "Task deleted.";
                }

                case 'updateFile': {
                    const file = findByName(state.files, args.fileName);
                    if (!file || file.type === 'FOLDER') return `Error: File "${args.fileName}" not found.`;
                    
                    let content = file.content || "";
                    if (args.operation === 'OVERWRITE') content = args.content;
                    else content += `\n${args.content}`;

                    dispatch({
                        type: 'UPDATE_FILE',
                        payload: { ...file, content, updatedAt: new Date().toISOString() }
                    });
                    return "File updated.";
                }

                case 'deleteFile': {
                    const file = findByName(state.files, args.name);
                    if (!file) return `Error: File or Folder "${args.name}" not found.`;
                    dispatch({ type: 'DELETE_FILE', payload: file.id });
                    return "File/Folder deleted.";
                }

                default:
                    return "Tool not recognized.";
            }
        };

        // Inject File Context (Limit to recently updated to save tokens)
        const fileContext = state.files
            .filter(f => f.type === 'FILE' && f.content)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5) 
            .map(f => `[File: ${f.name}]\n${f.content?.substring(0, 1500)}`)
            .join('\n\n');

        // Inject Bank Context
        const bankContext = state.bankAccounts
            .map(b => `- ${b.bankName} (${b.accountName}) [${b.type}]: ${b.currency}${b.balance}`)
            .join('\n');

        const history = messages.map(m => ({ role: m.role, text: m.text }));
        
        const responseText = await geminiService.sendMessage(
            history, 
            userMsg.text, 
            handleToolCall, 
            fileContext,
            state.userProfile.name || "User",
            state.settings.currency || "$",
            bankContext
        );

        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: Date.now()
        };
        dispatch({ type: 'ADD_MESSAGE', payload: aiMsg });

    } catch (error) {
        console.error("Chat Error:", error);
        dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id: Date.now().toString(),
                role: 'model',
                text: "Connection error. Please ensure you are online.",
                timestamp: Date.now(),
                isError: true
            }
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!state.userProfile.isLoggedIn) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'bg-zinc-800 text-white rotate-90' : 'bg-white text-black hover:scale-105'
        }`}
      >
        {isOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        ) : (
            <ICONS.AI className="w-7 h-7" />
        )}
      </button>

      <div 
        className={`fixed bottom-0 md:bottom-24 right-0 md:right-6 w-full md:w-96 md:max-w-[calc(100vw-3rem)] bg-zinc-900 border-t md:border border-zinc-800 rounded-t-2xl md:rounded-2xl shadow-2xl z-40 flex flex-col transition-all duration-300 origin-bottom-right ${
            isOpen 
                ? 'opacity-100 scale-100 h-[85vh] md:h-[600px] md:max-h-[80vh]' 
                : 'opacity-0 scale-90 h-0 pointer-events-none overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 rounded-t-2xl flex items-center justify-between flex-none">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isGeminiReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className="font-semibold text-zinc-200">2ndBrain OS</span>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => {
                        if(confirm("Clear chat history?")) dispatch({ type: 'CLEAR_CHAT' });
                    }}
                    className="text-xs text-zinc-500 hover:text-red-400"
                >
                    Clear
                </button>
                <button onClick={() => setIsOpen(false)} className="md:hidden text-zinc-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                        className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user' 
                                ? 'bg-white text-black rounded-tr-none' 
                                : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                        } ${msg.isError ? 'border-red-900 text-red-200 bg-red-900/20' : ''}`}
                    >
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-zinc-800 p-3 rounded-xl rounded-tl-none border border-zinc-700 flex gap-1">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900 md:rounded-b-2xl flex-none pb-safe">
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-600 transition-colors">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isGeminiReady ? "Command me..." : "Check API Key..."}
                    className="bg-transparent flex-1 text-sm text-white outline-none placeholder-zinc-600"
                    autoFocus
                    disabled={!isGeminiReady}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim() || !isGeminiReady}
                    className="text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                    <ICONS.Send className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
