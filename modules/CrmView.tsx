
import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Project, Task, Contact, TaskStatus } from '../types';
import { geminiService } from '../services/gemini';

type CrmTab = 'PROJECTS' | 'CLIENTS' | 'REPORTS';

const CrmView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [activeTab, setActiveTab] = useState<CrmTab>('PROJECTS');
  const currency = state.settings.currency || '$';
  
  // Project Drawer State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAmount, setNewTaskAmount] = useState('');
  const [taskViewMode, setTaskViewMode] = useState<'LIST' | 'BOARD'>('LIST');

  // Report State
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportResult, setReportResult] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // --- Calculations for Stats ---
  const activeProjects = state.projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'NOT_STARTED');
  const totalRevenue = state.projects.reduce((acc, p) => acc + p.budget, 0);
  const pendingTasks = state.tasks.filter(t => !t.isCompleted).length;

  // --- Handlers ---

  const openProject = (project: Project) => {
      setSelectedProject(project);
      setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
      setIsDrawerOpen(false);
      setSelectedProject(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject || !newTaskTitle.trim()) return;

      const newTask: Task = {
          id: Date.now().toString(),
          projectId: selectedProject.id,
          title: newTaskTitle,
          isCompleted: false,
          status: 'TODO',
          subtasks: [],
          amount: newTaskAmount ? Number(newTaskAmount) : undefined
      };

      dispatch({ type: 'ADD_TASK', payload: newTask });
      setNewTaskTitle('');
      setNewTaskAmount('');
  };

  const toggleTask = (task: Task) => {
      dispatch({
          type: 'UPDATE_TASK',
          payload: { ...task, isCompleted: !task.isCompleted }
      });
  };

  const moveTask = (task: Task, newStatus: TaskStatus) => {
      dispatch({
          type: 'UPDATE_TASK',
          payload: { ...task, status: newStatus }
      });
  };

  const handleDeleteTask = (taskId: string) => {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const handleDeleteProject = (projectId: string) => {
      if(confirm("Delete this project and all its tasks?")) {
          dispatch({ type: 'DELETE_PROJECT', payload: projectId });
          closeDrawer();
      }
  };

  const updateProjectStatus = (status: Project['status']) => {
      if(selectedProject) {
          const updated = { ...selectedProject, status };
          dispatch({ type: 'UPDATE_PROJECT', payload: updated });
          setSelectedProject(updated);
      }
  };

  // --- Report Helpers ---
  const setReportRange = (days: number) => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      
      setReportEndDate(end.toISOString().split('T')[0]);
      setReportStartDate(start.toISOString().split('T')[0]);
  };

  // --- Report Generation ---
  const generateWorkReport = async () => {
      setIsGeneratingReport(true);
      setReportResult('');

      if (reportStartDate > reportEndDate) {
          setReportResult("Error: Start Date cannot be later than End Date.");
          setIsGeneratingReport(false);
          return;
      }

      const start = new Date(reportStartDate);
      start.setHours(0,0,0,0);
      const end = new Date(reportEndDate);
      end.setHours(23,59,59,999);

      // Gather Data within range
      const completedTasks = state.tasks.filter(t => {
          if (!t.isCompleted || !t.completedAt) return false;
          const d = new Date(t.completedAt);
          return d >= start && d <= end;
      });

      // Filter events by string comparison YYYY-MM-DD
      const events = state.events.filter(e => e.date >= reportStartDate && e.date <= reportEndDate);
      
      // Gather habits completed within range
      const habitsInRange: string[] = [];
      Object.entries(state.habitLog).forEach(([date, habitIds]) => {
          if (date >= reportStartDate && date <= reportEndDate) {
              (habitIds as string[]).forEach(id => {
                 const habit = state.habits.find(h => h.id === id);
                 if (habit) habitsInRange.push(`${habit.title} (${date})`);
              });
          }
      });

      // Notes created within range
      const notes = state.notes.filter(n => {
          const d = new Date(n.createdAt);
          return d >= start && d <= end;
      });

      const dataContext = `
        Report Period: ${reportStartDate} to ${reportEndDate}
        Currency Used: ${currency}
        
        Completed Tasks: 
        ${completedTasks.map(t => `- ${t.title} ${t.amount ? `(${currency}${t.amount})` : ''} (Completed: ${new Date(t.completedAt!).toLocaleDateString()})`).join('\n') || 'None'}
        
        Calendar Events: 
        ${events.map(e => `- ${e.title} (${e.date} ${e.startTime})`).join('\n') || 'None'}
        
        Habits Completed: 
        ${habitsInRange.join(', ') || 'None'}
        
        Notes Created: 
        ${notes.map(n => `- ${n.title} (${new Date(n.createdAt).toLocaleDateString()})`).join('\n') || 'None'}
      `;

      try {
          const prompt = `
            Generate a comprehensive professional work report based on the following activity log.
            The report covers the period from ${reportStartDate} to ${reportEndDate}.
            
            Format the output cleanly using Markdown with the following sections:
            1. **Executive Summary**: A brief overview of productivity during this period.
            2. **Key Accomplishments**: Focus on completed tasks and revenue generated (if task amounts exist).
            3. **Meetings & Schedule**: Summary of calendar events.
            4. **Focus & Habits**: Analysis of daily habits and notes created.
            
            Use a professional, concise, and action-oriented tone.
            
            Data:
            ${dataContext}
          `;

          const response = await geminiService.sendMessage([], prompt, async () => ({}));
          setReportResult(response);

      } catch (e) {
          setReportResult("Failed to generate report. Please check your network connection.");
          console.error(e);
      } finally {
          setIsGeneratingReport(false);
      }
  };


  // --- Subcomponents ---

  const StatusBadge = ({status}: {status: string}) => {
      const colors: any = {
          'NOT_STARTED': 'bg-zinc-800 text-zinc-400',
          'IN_PROGRESS': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          'COMPLETED': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          'ON_HOLD': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      };
      return (
          <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded border border-transparent ${colors[status] || colors['NOT_STARTED']}`}>
              {status.replace('_', ' ')}
          </span>
      );
  };

  const KanbanColumn = ({ title, status, tasks }: { title: string, status: TaskStatus, tasks: Task[] }) => (
    <div className="flex flex-col bg-zinc-900/30 rounded-lg border border-zinc-800 h-full max-h-[500px]">
        <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-zinc-400">{title}</span>
            <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded text-[10px]">{tasks.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tasks.map(task => (
                <div key={task.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded shadow-sm hover:border-zinc-600 transition-all group">
                    <div className="flex justify-between items-start">
                        <span className="text-sm text-zinc-200 font-medium line-clamp-2">{task.title}</span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            &times;
                        </button>
                    </div>
                    {task.amount && task.amount > 0 && (
                        <div className="mt-2 text-xs font-mono text-zinc-500">{currency}{task.amount.toLocaleString()}</div>
                    )}
                    <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-zinc-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        {status !== 'TODO' && (
                            <button onClick={() => moveTask(task, status === 'DONE' ? 'IN_PROGRESS' : 'TODO')} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white" title="Move Back">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                        )}
                        {status !== 'DONE' && (
                            <button onClick={() => moveTask(task, status === 'TODO' ? 'IN_PROGRESS' : 'DONE')} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white" title="Move Forward">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {tasks.length === 0 && (
                <div className="text-center py-4 text-zinc-600 text-xs italic">Empty</div>
            )}
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#09090b] overflow-hidden relative">
        
        {/* Header & Stats */}
        <div className="flex-none p-6 md:p-8 border-b border-zinc-900 bg-[#09090b]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-light tracking-tight text-white">Smart CRM</h2>
                <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button onClick={() => setActiveTab('PROJECTS')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'PROJECTS' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Projects</button>
                    <button onClick={() => setActiveTab('CLIENTS')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'CLIENTS' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Clients</button>
                    <button onClick={() => setActiveTab('REPORTS')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'REPORTS' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Reports</button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Active Projects</div>
                    <div className="text-2xl font-bold text-white mt-1">{activeProjects.length}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Projected Revenue</div>
                    <div className="text-2xl font-bold text-white mt-1">{currency}{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Pending Tasks</div>
                    <div className="text-2xl font-bold text-blue-400 mt-1">{pendingTasks}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Clients</div>
                    <div className="text-2xl font-bold text-white mt-1">{state.contacts.length}</div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            
            {/* PROJECTS TAB */}
            {activeTab === 'PROJECTS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {state.projects.length === 0 && (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                            <p className="text-zinc-500">No projects yet.</p>
                            <p className="text-zinc-600 text-sm">Ask AI to "Create a new project for Website Redesign".</p>
                        </div>
                    )}
                    {state.projects.map(project => {
                        const pTasks = state.tasks.filter(t => t.projectId === project.id);
                        const completedCount = pTasks.filter(t => t.isCompleted).length;
                        const progress = pTasks.length > 0 ? (completedCount / pTasks.length) * 100 : 0;
                        const totalTaskValue = pTasks.reduce((sum, t) => sum + (t.amount || 0), 0);

                        return (
                            <div 
                                key={project.id} 
                                onClick={() => openProject(project)}
                                className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all cursor-pointer flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <StatusBadge status={project.status} />
                                    <span className="text-zinc-500 text-xs font-mono">{new Date(project.deadline).toLocaleDateString()}</span>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors">{project.title}</h3>
                                <p className="text-zinc-500 text-sm mb-4">{project.clientName}</p>
                                
                                <div className="mt-auto">
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center pt-4 border-t border-zinc-800/50">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-400 text-xs font-mono">Budget: {currency}{project.budget.toLocaleString()}</span>
                                            {totalTaskValue > 0 && (
                                                 <span className="text-zinc-500 text-[10px] font-mono">Tasks: {currency}{totalTaskValue.toLocaleString()}</span>
                                            )}
                                        </div>
                                        <span className="text-zinc-600 text-xs">{pTasks.length} tasks</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CLIENTS TAB */}
            {activeTab === 'CLIENTS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {state.contacts.length === 0 && (
                        <div className="col-span-full text-center py-20 text-zinc-600">No contacts found.</div>
                    )}
                    {state.contacts.map(contact => (
                        <div key={contact.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">
                                {contact.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{contact.name}</h4>
                                <p className="text-sm text-zinc-500">{contact.company || 'Independent'}</p>
                                <div className="mt-1 inline-block">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${contact.status === 'CLIENT' ? 'border-emerald-900 text-emerald-400' : 'border-zinc-700 text-zinc-500'}`}>
                                        {contact.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'REPORTS' && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-lg">
                        <h3 className="text-xl font-light mb-6 flex items-center gap-2 text-white">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Work Report Generator
                        </h3>
                        
                        <div className="mb-6">
                             <div className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Quick Presets</div>
                             <div className="flex gap-2">
                                 <button onClick={() => setReportRange(0)} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded hover:bg-zinc-700 border border-transparent hover:border-zinc-600 transition-colors">Today</button>
                                 <button onClick={() => setReportRange(7)} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded hover:bg-zinc-700 border border-transparent hover:border-zinc-600 transition-colors">Last 7 Days</button>
                                 <button onClick={() => setReportRange(30)} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded hover:bg-zinc-700 border border-transparent hover:border-zinc-600 transition-colors">Last 30 Days</button>
                             </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-xs text-zinc-400 mb-1 ml-1 font-medium">Start Date</label>
                                <input 
                                    type="date" 
                                    value={reportStartDate}
                                    max={reportEndDate}
                                    onChange={(e) => setReportStartDate(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs text-zinc-400 mb-1 ml-1 font-medium">End Date</label>
                                <input 
                                    type="date" 
                                    value={reportEndDate}
                                    min={reportStartDate}
                                    onChange={(e) => setReportEndDate(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            <button 
                                onClick={generateWorkReport}
                                disabled={isGeneratingReport}
                                className="w-full md:w-auto px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 h-[48px] flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                            >
                                {isGeneratingReport ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></span>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    'Generate Report'
                                )}
                            </button>
                        </div>

                        {reportResult ? (
                            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 relative animate-fade-in">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-lg"></div>
                                <pre className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed text-sm overflow-x-auto">
                                    {reportResult}
                                </pre>
                                <div className="mt-4 pt-4 border-t border-zinc-900 text-right">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(reportResult);
                                            alert("Report copied to clipboard!");
                                        }}
                                        className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-zinc-300 transition-colors"
                                    >
                                        Copy to Clipboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
                                <div className="text-zinc-500 mb-1">Select a date range and generate your professional work summary.</div>
                                <div className="text-zinc-600 text-xs">Powered by Google Gemini</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* PROJECT DRAWER (Side Modal) */}
        <div className={`absolute inset-y-0 right-0 w-full md:w-[700px] bg-[#0c0c0e] border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 z-30 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedProject && (
                <>
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-4">
                                <input 
                                    type="text" 
                                    value={selectedProject.title}
                                    onChange={(e) => {
                                        const updated = { ...selectedProject, title: e.target.value };
                                        dispatch({ type: 'UPDATE_PROJECT', payload: updated });
                                        setSelectedProject(updated);
                                    }}
                                    className="bg-transparent text-2xl font-bold text-white outline-none w-full placeholder-zinc-700"
                                />
                                <input 
                                    type="text"
                                    value={selectedProject.clientName}
                                    onChange={(e) => {
                                        const updated = { ...selectedProject, clientName: e.target.value };
                                        dispatch({ type: 'UPDATE_PROJECT', payload: updated });
                                        setSelectedProject(updated);
                                    }}
                                    className="bg-transparent text-zinc-500 text-sm outline-none w-full mt-1"
                                />
                            </div>
                            <button onClick={closeDrawer} className="text-zinc-500 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-2">
                                {(['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'] as const).map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => updateProjectStatus(s)}
                                        className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${selectedProject.status === s ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        
                        {/* Description */}
                        <div>
                            <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-2">Description</h4>
                            <textarea 
                                value={selectedProject.description}
                                onChange={(e) => {
                                    const updated = { ...selectedProject, description: e.target.value };
                                    dispatch({ type: 'UPDATE_PROJECT', payload: updated });
                                    setSelectedProject(updated);
                                }}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 outline-none focus:border-zinc-600 min-h-[80px]"
                            />
                        </div>

                        {/* Tasks Section */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Tasks</h4>
                                
                                <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                                    <button 
                                        onClick={() => setTaskViewMode('LIST')}
                                        className={`p-1.5 rounded transition-colors ${taskViewMode === 'LIST' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        title="List View"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => setTaskViewMode('BOARD')}
                                        className={`p-1.5 rounded transition-colors ${taskViewMode === 'BOARD' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        title="Board View"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleAddTask} className="mb-6">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newTaskTitle} 
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Add a new task..."
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                    />
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-zinc-500 text-sm">{currency}</span>
                                        <input 
                                            type="number"
                                            value={newTaskAmount}
                                            onChange={(e) => setNewTaskAmount(e.target.value)}
                                            placeholder="Amount"
                                            className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg pl-6 pr-2 py-2 text-sm text-white outline-none focus:border-blue-500 placeholder-zinc-600"
                                        />
                                    </div>
                                    <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-500">+</button>
                                </div>
                            </form>

                            {taskViewMode === 'LIST' ? (
                                <div className="space-y-2">
                                    {state.tasks.filter(t => t.projectId === selectedProject.id).map(task => (
                                        <div key={task.id} className="group flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all">
                                            <div 
                                                onClick={() => toggleTask(task)}
                                                className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors flex-shrink-0 ${task.isCompleted ? 'bg-blue-500 border-blue-500' : 'border-zinc-600 hover:border-zinc-400'}`}
                                            >
                                                {task.isCompleted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm ${task.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{task.title}</div>
                                                <div className="flex gap-2 mt-0.5">
                                                    <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-500">{task.status || 'TODO'}</span>
                                                </div>
                                            </div>
                                            
                                            {task.amount !== undefined && task.amount > 0 && (
                                                <span className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-mono text-zinc-400 whitespace-nowrap">
                                                    {currency}{task.amount.toLocaleString()}
                                                </span>
                                            )}

                                            <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity">
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {state.tasks.filter(t => t.projectId === selectedProject.id).length === 0 && (
                                        <div className="text-center text-zinc-600 text-sm py-4">No tasks added yet.</div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 h-[500px]">
                                    <KanbanColumn 
                                        title="To Do" 
                                        status="TODO" 
                                        tasks={state.tasks.filter(t => t.projectId === selectedProject.id && (!t.status || t.status === 'TODO'))} 
                                    />
                                    <KanbanColumn 
                                        title="In Progress" 
                                        status="IN_PROGRESS" 
                                        tasks={state.tasks.filter(t => t.projectId === selectedProject.id && t.status === 'IN_PROGRESS')} 
                                    />
                                    <KanbanColumn 
                                        title="Done" 
                                        status="DONE" 
                                        tasks={state.tasks.filter(t => t.projectId === selectedProject.id && (t.status === 'DONE' || t.isCompleted))} 
                                    />
                                </div>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div className="pt-6 border-t border-zinc-800 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-zinc-500 text-xs mb-1">Deadline</label>
                                <input 
                                    type="date" 
                                    value={selectedProject.deadline.split('T')[0]}
                                    onChange={(e) => {
                                        const updated = { ...selectedProject, deadline: e.target.value };
                                        dispatch({ type: 'UPDATE_PROJECT', payload: updated });
                                        setSelectedProject(updated);
                                    }}
                                    className="bg-transparent text-sm text-white outline-none border-b border-zinc-800 w-full py-1"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs mb-1">Budget</label>
                                <div className="flex items-center border-b border-zinc-800">
                                    <span className="text-zinc-500 text-sm">{currency}</span>
                                    <input 
                                        type="number" 
                                        value={selectedProject.budget}
                                        onChange={(e) => {
                                            const updated = { ...selectedProject, budget: Number(e.target.value) };
                                            dispatch({ type: 'UPDATE_PROJECT', payload: updated });
                                            setSelectedProject(updated);
                                        }}
                                        className="bg-transparent text-sm text-white outline-none w-full py-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
                        <button 
                            onClick={() => handleDeleteProject(selectedProject.id)}
                            className="w-full py-3 border border-red-900/30 text-red-500 bg-red-900/10 rounded-lg text-sm font-medium hover:bg-red-900/20 transition-colors"
                        >
                            Delete Project
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default CrmView;
