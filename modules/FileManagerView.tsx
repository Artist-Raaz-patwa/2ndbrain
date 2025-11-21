
import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { FileItem } from '../types';

const FileManagerView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  // Create / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE_FILE' | 'CREATE_FOLDER' | 'EDIT_FILE'>('CREATE_FILE');
  const [nameInput, setNameInput] = useState('');
  const [contentInput, setContentInput] = useState('');

  // --- Navigation ---

  const currentFiles = state.files.filter(f => f.parentId === currentFolderId);
  
  // Calculate breadcrumbs
  const getBreadcrumbs = () => {
      const crumbs = [{ id: null, name: 'Home' }];
      let curr = currentFolderId;
      const path = [];
      
      while(curr) {
          const folder = state.files.find(f => f.id === curr);
          if(folder) {
              path.unshift({ id: folder.id, name: folder.name });
              curr = folder.parentId;
          } else {
              break;
          }
      }
      return [...crumbs, ...path];
  };

  // --- Handlers ---

  const handleOpenItem = (item: FileItem) => {
      if (item.type === 'FOLDER') {
          setCurrentFolderId(item.id);
          setSelectedFile(null);
      } else {
          setSelectedFile(item);
          setNameInput(item.name);
          setContentInput(item.content || '');
          setModalMode('EDIT_FILE');
          setIsModalOpen(true);
      }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm('Delete this item?')) {
          dispatch({ type: 'DELETE_FILE', payload: id });
      }
  };

  const handleSave = () => {
      if (!nameInput.trim()) return;

      const now = new Date().toISOString();

      if (modalMode === 'EDIT_FILE' && selectedFile) {
          dispatch({
              type: 'UPDATE_FILE',
              payload: {
                  ...selectedFile,
                  name: nameInput,
                  content: contentInput,
                  updatedAt: now
              }
          });
      } else {
          // Create
          const newItem: FileItem = {
              id: Date.now().toString(),
              parentId: currentFolderId,
              name: nameInput,
              type: modalMode === 'CREATE_FOLDER' ? 'FOLDER' : 'FILE',
              content: modalMode === 'CREATE_FILE' ? contentInput : undefined,
              createdAt: now,
              updatedAt: now
          };
          dispatch({ type: 'ADD_FILE', payload: newItem });
      }
      setIsModalOpen(false);
      setNameInput('');
      setContentInput('');
      setSelectedFile(null);
  };

  const openCreateModal = (mode: 'CREATE_FILE' | 'CREATE_FOLDER') => {
      setModalMode(mode);
      setNameInput('');
      setContentInput('');
      setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] relative">
        {/* Header */}
        <div className="flex-none p-6 md:p-8 border-b border-zinc-900 bg-[#09090b] flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-light tracking-tight text-white">File Manager</h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500">
                    {getBreadcrumbs().map((crumb: any, i) => (
                        <React.Fragment key={i}>
                            <button 
                                onClick={() => setCurrentFolderId(crumb.id)}
                                className="hover:text-white hover:underline"
                            >
                                {crumb.name}
                            </button>
                            {i < getBreadcrumbs().length - 1 && <span>/</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => openCreateModal('CREATE_FOLDER')}
                    className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    New Folder
                </button>
                <button 
                    onClick={() => openCreateModal('CREATE_FILE')}
                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    New File
                </button>
            </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {currentFiles.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                    <div className="text-zinc-600 mb-2">This folder is empty.</div>
                    <div className="text-zinc-700 text-sm">Files created here are readable by the AI Assistant.</div>
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentFiles.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => handleOpenItem(item)}
                        className="group relative aspect-[4/3] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-zinc-800 hover:border-zinc-600 cursor-pointer transition-all"
                    >
                        <div className="text-zinc-400 group-hover:text-white mb-3">
                            {item.type === 'FOLDER' ? (
                                <svg className="w-12 h-12 fill-blue-500/20 stroke-blue-500" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            ) : (
                                <svg className="w-12 h-12 text-zinc-600 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm text-center text-zinc-400 group-hover:text-white truncate w-full px-2">
                            {item.name}
                        </span>
                        <button 
                            onClick={(e) => handleDelete(e, item.id)}
                            className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Editor/Creator Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-white">
                            {modalMode === 'CREATE_FOLDER' ? 'New Folder' : modalMode === 'CREATE_FILE' ? 'New File' : 'Edit File'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">&times;</button>
                    </div>
                    
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Name</label>
                            <input 
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder={modalMode === 'CREATE_FOLDER' ? "Folder Name" : "filename.txt"}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                                autoFocus
                            />
                        </div>
                        
                        {modalMode !== 'CREATE_FOLDER' && (
                             <div className="h-[400px] flex flex-col">
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Content</label>
                                <textarea 
                                    value={contentInput}
                                    onChange={(e) => setContentInput(e.target.value)}
                                    className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-300 outline-none focus:border-blue-500 font-mono text-sm resize-none"
                                    placeholder="Type your content here..."
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200">Save</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default FileManagerView;
