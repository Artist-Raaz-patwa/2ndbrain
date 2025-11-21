
import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Note } from '../types';

const NotesView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  
  // If no note is selected but notes exist, select the first one on DESKTOP only
  useEffect(() => {
    if (window.innerWidth >= 768) {
        if (!selectedNoteId && state.notes.length > 0) {
            setSelectedNoteId(state.notes[0].id);
        }
    }
  }, [state.notes.length]);

  const activeNote = state.notes.find(n => n.id === selectedNoteId);

  const handleSelectNote = (id: string) => {
      setSelectedNoteId(id);
      setShowMobileList(false);
  };

  const handleCreateNote = () => {
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      tags: [],
      isBookmarked: false
    };
    dispatch({ type: 'ADD_NOTE', payload: newNote });
    setSelectedNoteId(newId);
    setShowMobileList(false);
  };

  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    if (activeNote) {
      dispatch({ 
        type: 'UPDATE_NOTE', 
        payload: { ...activeNote, [field]: value } 
      });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('Rip this page out?')) {
        dispatch({ type: 'DELETE_NOTE', payload: id });
        if (selectedNoteId === id) {
            setSelectedNoteId(null);
            setShowMobileList(true);
        }
    }
  };

  return (
    <div className="h-full w-full bg-[#121212] flex items-center justify-center p-0 md:p-8 overflow-hidden relative">
      {/* Desk Texture Background Effect (Desktop only) */}
      <div className="hidden md:block absolute inset-0 opacity-20 pointer-events-none" 
           style={{backgroundImage: 'radial-gradient(circle at center, #333 0%, #000 100%)'}}>
      </div>

      {/* The Notebook Container */}
      <div className="relative w-full max-w-6xl h-full md:h-[90vh] flex flex-col md:flex-row shadow-none md:shadow-2xl rounded-none md:rounded-r-3xl md:rounded-l-md bg-[#09090b] transition-all duration-500 perspective-1000">
        
        {/* Spine / Binding (Desktop) */}
        <div className="hidden md:block w-12 h-full bg-gradient-to-r from-[#1a1a1a] to-[#000] border-r border-zinc-800 relative z-20 rounded-l-md">
             <div className="absolute left-2 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-zinc-700 opacity-50"></div>
        </div>

        {/* LEFT PAGE: Table of Contents / Index */}
        <div className={`w-full md:w-1/3 h-full bg-[#1c1c1f] border-r border-[#2a2a2e] relative flex flex-col z-10 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Header */}
            <div className="p-6 md:p-8 pb-4 border-b border-zinc-800/50 flex items-center justify-between">
                <div>
                    <h2 className="font-hand text-3xl md:text-4xl text-zinc-200 tracking-wide">Index</h2>
                    <p className="font-serif text-zinc-500 italic mt-1">My Personal Thoughts</p>
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <div className="space-y-1">
                    {state.notes.length === 0 && (
                        <div className="text-zinc-600 font-hand text-xl text-center mt-10">
                            No pages yet...
                        </div>
                    )}
                    {state.notes.map((note, index) => (
                        <div 
                            key={note.id}
                            onClick={() => handleSelectNote(note.id)}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border-b border-dashed border-zinc-800/50
                                ${selectedNoteId === note.id ? 'bg-zinc-800/50 translate-x-2 shadow-sm' : 'hover:bg-zinc-800/30 hover:translate-x-1'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="font-hand text-zinc-500 text-lg w-6">#{index + 1}</span>
                                <span className={`font-hand text-xl truncate ${selectedNoteId === note.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                    {note.title || "Untitled Page"}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {note.isBookmarked && (
                                    <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M5 5c0-1.1.9-2 2-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                                )}
                                <button 
                                    onClick={(e) => handleDelete(e, note.id)}
                                    className="md:opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity px-2"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 md:p-6 border-t border-zinc-800/50 bg-[#1c1c1f]">
                <button 
                    onClick={handleCreateNote}
                    className="w-full py-3 border-2 border-dashed border-zinc-700 text-zinc-400 font-hand text-xl hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30 rounded-lg transition-all"
                >
                    + Create New Page
                </button>
            </div>
        </div>

        {/* RIGHT PAGE: Active Note / Editor */}
        <div className={`flex-1 h-full bg-[#222225] relative flex flex-col overflow-hidden md:rounded-r-3xl ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {/* Paper Texture & Lines */}
            <div className="absolute inset-0 pointer-events-none z-0"
                 style={{
                     backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #3f3f46 31px, #3f3f46 32px)',
                     backgroundAttachment: 'local',
                     opacity: 0.3,
                     marginTop: '96px' // Offset for header
                 }}>
            </div>
            
            {/* Vertical Red Margin Line */}
            <div className="absolute top-0 bottom-0 left-6 md:left-20 w-px bg-red-500/20 z-0 pointer-events-none"></div>

            {activeNote ? (
                <>
                     {/* Mobile Back Button */}
                     <button 
                        onClick={() => setShowMobileList(true)}
                        className="md:hidden absolute top-4 left-4 z-40 p-2 text-zinc-400"
                     >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>

                    {/* Bookmark Ribbon */}
                    <div 
                        onClick={() => dispatch({ type: 'TOGGLE_NOTE_BOOKMARK', payload: activeNote.id })}
                        className={`absolute top-0 right-4 md:right-8 w-8 h-12 cursor-pointer z-30 transition-all duration-300 hover:h-14 shadow-md flex flex-col
                            ${activeNote.isBookmarked ? 'translate-y-0' : '-translate-y-8 hover:-translate-y-4'}
                        `}
                    >
                        <div className="flex-1 bg-red-700"></div>
                        <div className="border-l-[16px] border-r-[16px] border-t-[10px] border-l-red-700 border-r-red-700 border-t-transparent rotate-180"></div>
                    </div>

                    {/* Editor Header */}
                    <div className="pt-16 md:pt-8 px-8 md:px-16 pb-2 z-10 flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
                        <input 
                            type="text"
                            value={activeNote.title}
                            onChange={(e) => handleUpdateNote('title', e.target.value)}
                            placeholder="Page Title..."
                            className="flex-1 bg-transparent border-none outline-none font-hand text-3xl md:text-4xl text-zinc-200 placeholder-zinc-600"
                        />
                        <span className="font-serif text-zinc-500 italic text-sm mb-2">
                            {new Date(activeNote.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Content Editor */}
                    <div className="flex-1 overflow-y-auto px-8 md:px-20 pb-10 z-10 custom-scrollbar relative">
                        <textarea 
                            value={activeNote.content}
                            onChange={(e) => handleUpdateNote('content', e.target.value)}
                            placeholder="Start writing here..."
                            className="w-full h-full bg-transparent border-none outline-none font-serif text-lg md:text-xl text-zinc-300 resize-none leading-[32px] placeholder-zinc-700"
                            style={{
                                lineHeight: '32px', // Must match gradient size
                            }}
                            spellCheck={false}
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 opacity-50 z-10 p-4 text-center">
                    <svg className="w-24 h-24 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="font-hand text-2xl">Select a page to begin reading</p>
                </div>
            )}
        </div>

        {/* Notebook Edge Effect (Desktop only) */}
        <div className="hidden md:block absolute top-[1%] bottom-[1%] -right-2 w-4 bg-[#18181b] rounded-r-md border-l border-zinc-900 z-0 shadow-xl transform skew-y-1"></div>
      </div>
    </div>
  );
};

export default NotesView;
