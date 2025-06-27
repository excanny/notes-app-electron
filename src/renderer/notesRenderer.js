
import NotesDB from '../../NotesDB.js'; 


// Application state and variables
let notesDB = new NotesDB();
let editingNoteId = null;
let isLoading = false;
let autoSaveTimer = null;
let hasUnsavedChanges = false;
let lastSavedTitle = '';
let lastSavedContent = '';
let loadNotesTimeout;


async function initApp() {
    if (isLoading) return;
    isLoading = true;

    try {
        const statusEl = document.getElementById('db-status');
        statusEl.innerHTML = '<span>🔄</span> Initializing offline database...';

        await notesDB.init();

        statusEl.innerHTML = '<span>✅</span> Offline database ready!';
        setTimeout(() => {
            if (statusEl) {
                statusEl.style.display = 'none';
            }
        }, 3000);

        await loadNotes();
    } catch (error) {
        console.error('App initialization failed:', error);
        const statusEl = document.getElementById('db-status');
        if (statusEl) {
            statusEl.className = 'db-status error';
            statusEl.innerHTML = '<span>❌</span> Database initialization failed!';
        }
    } finally {
        isLoading = false;
    }
}


async function loadNotes() {
    if (loadNotesTimeout) {
        clearTimeout(loadNotesTimeout);
    }

    loadNotesTimeout = setTimeout(async () => {
        try {
            const notes = await notesDB.getAllNotes();
            renderNotes(notes);
        } catch (error) {
            console.error('Failed to load notes:', error);
            const notesList = document.getElementById('notes-list');
            if (notesList) {
                notesList.innerHTML = '<div class="loading">Failed to load notes</div>';
            }
        }
    }, 100);
}

function renderNotes(notes) {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;
    
    if (notes.length === 0) {
        notesList.innerHTML = '<div class="loading">No notes yet. Create your first note!</div>';
        return;
    }

    const fragment = document.createDocumentFragment();
    
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.color || 'yellow'}`;
        
        const truncatedContent = note.content.length > 100 
            ? note.content.substring(0, 100) + '...' 
            : note.content;
        
        noteCard.innerHTML = `
            <div class="note-content">
                <h2>${escapeHtml(note.title)}</h2>
                <p>${escapeHtml(truncatedContent)}</p>
            </div>
            <div class="note-actions">
                <button class="edit-btn" onclick="event.stopPropagation(); editNote(${note.id})" title="Edit">
                    ✏️
                </button>
                <button class="delete-btn" onclick="event.stopPropagation(); deleteNote(${note.id})" title="Delete">
                    🗑️
                </button>
            </div>
        `;
        
        noteCard.addEventListener('click', function() {
            editNote(note.id);
        });
        
        fragment.appendChild(noteCard);
    });

    notesList.innerHTML = '';
    notesList.appendChild(fragment);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function editNote(noteId) {
    try {
        const note = await notesDB.getNote(noteId);
        if (note) {
            editingNoteId = noteId;
            const titleInput = document.getElementById('note-title');
            const contentInput = document.getElementById('note-content');
            const editorTitle = document.querySelector('#note-editor h2');
            const editor = document.getElementById('note-editor');
            
            if (titleInput) titleInput.value = note.title || '';
            if (contentInput) contentInput.value = note.content || '';
            if (editorTitle) editorTitle.textContent = 'Edit Note';
            if (editor) {
                editor.classList.add('show');
                titleInput?.focus();
            }
            
            lastSavedTitle = note.title || '';
            lastSavedContent = note.content || '';
            hasUnsavedChanges = false;
            updateAutoSaveStatus('saved');
            startAutoSave();
        }
    } catch (error) {
        console.error('Failed to load note for editing:', error);
        alert('Failed to load note for editing');
    }
}

async function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            await notesDB.deleteNote(noteId);
            await loadNotes();
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('Failed to delete note');
        }
    }
}

function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    
    autoSaveTimer = setInterval(async () => {
        if (hasUnsavedChanges && (editingNoteId || getCurrentTitle() || getCurrentContent())) {
            await autoSaveNote();
        }
    }, 10000);
}

function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
    hasUnsavedChanges = false;
    updateAutoSaveStatus('saved');
}

function getCurrentTitle() {
    const titleInput = document.getElementById('note-title');
    return titleInput ? titleInput.value.trim() : '';
}

function getCurrentContent() {
    const contentInput = document.getElementById('note-content');
    return contentInput ? contentInput.value.trim() : '';
}

function checkForChanges() {
    const currentTitle = getCurrentTitle();
    const currentContent = getCurrentContent();
    
    if (currentTitle !== lastSavedTitle || currentContent !== lastSavedContent) {
        hasUnsavedChanges = true;
        updateAutoSaveStatus('unsaved');
    } else {
        hasUnsavedChanges = false;
        updateAutoSaveStatus('saved');
    }
}

function updateAutoSaveStatus(status) {
    const statusElement = document.getElementById('auto-save-status');
    if (!statusElement) return;
    
    statusElement.className = `auto-save-status ${status}`;
    
    switch (status) {
        case 'unsaved':
            statusElement.textContent = '● Unsaved changes - will auto-save in 10 seconds';
            break;
        case 'saving':
            statusElement.textContent = '💾 Auto-saving...';
            break;
        case 'saved':
            statusElement.textContent = '✅ All changes saved';
            break;
        default:
            statusElement.textContent = 'Auto-save ready';
    }
}

async function autoSaveNote() {
    const title = getCurrentTitle();
    const content = getCurrentContent();
    
    if (!title && !content) {
        return;
    }
    
    if (!editingNoteId && (!title || !content)) {
        return;
    }

    try {
        updateAutoSaveStatus('saving');
        
        const note = {
            title: title || 'Untitled Note',
            content: content || '',
            color: editingNoteId ? undefined : ['yellow', 'green', 'pink'][Math.floor(Math.random() * 3)]
        };

        if (editingNoteId) {
            note.id = editingNoteId;
            const existingNote = await notesDB.getNote(editingNoteId);
            if (existingNote) {
                note.color = existingNote.color;
            }
        } else {
            const savedId = await notesDB.saveNote(note);
            editingNoteId = savedId;
            
            const editorTitle = document.querySelector('#note-editor h2');
            if (editorTitle) editorTitle.textContent = 'Edit Note';
        }

        if (editingNoteId) {
            await notesDB.saveNote(note);
        }

        lastSavedTitle = title;
        lastSavedContent = content;
        hasUnsavedChanges = false;
        
        await loadNotes();
        updateAutoSaveStatus('saved');
        showAutoSaveIndicator();
        
    } catch (error) {
        console.error('Auto-save failed:', error);
        updateAutoSaveStatus('unsaved');
    }
}

function showAutoSaveIndicator() {
    let indicator = document.getElementById('auto-save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'auto-save-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(74, 222, 128, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = '💾 Auto-saved';
    indicator.style.opacity = '1';
    
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// DOM Content Loaded Event Handler
document.addEventListener('DOMContentLoaded', function() {
    const newNoteBtn = document.getElementById('new-note-btn');
    const noteEditor = document.getElementById('note-editor');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const appCloseBtn = document.getElementById('app-close-btn');
    const exportBtn = document.getElementById('export-btn');
    const titleInput = document.getElementById('note-title');
    const contentTextarea = document.getElementById('note-content');

    // New Note Button
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', function() {
            editingNoteId = null;
            if (titleInput) titleInput.value = '';
            if (contentTextarea) contentTextarea.value = '';
            const editorTitle = noteEditor?.querySelector('h2');
            if (editorTitle) editorTitle.textContent = 'Create New Note';
            
            lastSavedTitle = '';
            lastSavedContent = '';
            hasUnsavedChanges = false;
            updateAutoSaveStatus('ready');
            
            if (noteEditor) {
                if (noteEditor.classList.contains('show')) {
                    noteEditor.classList.remove('show');
                    stopAutoSave();
                } else {
                    noteEditor.classList.add('show');
                    titleInput?.focus();
                    startAutoSave();
                }
            }
        });
    }

    // Cancel Button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (noteEditor) {
                noteEditor.classList.remove('show');
            }
            editingNoteId = null;
            stopAutoSave();
        });
    }

    // Click outside editor to close
    if (noteEditor) {
        noteEditor.addEventListener('click', function(e) {
            if (e.target === noteEditor) {
                noteEditor.classList.remove('show');
                editingNoteId = null;
                stopAutoSave();
            }
        });
    }

    if (appCloseBtn) {
        appCloseBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to close the Notes app?')) {
               if (window.electronAPI) {
                window.electronAPI.closeApp();
            }
            }
        });
    }

    // Save Button
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            const title = titleInput?.value.trim() || '';
            const content = contentTextarea?.value.trim() || '';
            
            if (!title || !content) {
                alert('Please fill in both title and content');
                return;
            }

            try {
                const note = {
                    title: title,
                    content: content,
                    color: editingNoteId ? undefined : ['yellow', 'green', 'pink'][Math.floor(Math.random() * 3)]
                };

                if (editingNoteId) {
                    note.id = editingNoteId;
                    const existingNote = await notesDB.getNote(editingNoteId);
                    if (existingNote) {
                        note.color = existingNote.color;
                    }
                }

                await notesDB.saveNote(note);
                window.electronAPI.notifySaveSuccess();
                await loadNotes();
                
                if (noteEditor) {
                    noteEditor.classList.remove('show');
                }
                editingNoteId = null;
                stopAutoSave();
            } catch (error) {
                console.error('Failed to save note:', error);
                alert('Failed to save note');
            }
        });
    }

    // Export Button (new functionality)
    if (exportBtn) {
        exportBtn.addEventListener('click', async function() {
            try {
                const jsonData = await notesDB.exportNotes();
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Export failed:', error);
                alert('Failed to export notes');
            }
        });
    }

    // Input change listeners
    if (titleInput) {
        titleInput.addEventListener('input', checkForChanges);
        titleInput.addEventListener('paste', () => setTimeout(checkForChanges, 100));
    }

    if (contentTextarea) {
        contentTextarea.addEventListener('input', checkForChanges);
        contentTextarea.addEventListener('paste', () => setTimeout(checkForChanges, 100));
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            newNoteBtn?.click();
        }
        if (e.key === 'Escape' && noteEditor?.classList.contains('show')) {
            cancelBtn?.click();
        }
        if (e.ctrlKey && e.key === 's' && noteEditor?.classList.contains('show')) {
            e.preventDefault();
            saveBtn?.click();
        }
    });

    // Global functions for onclick handlers
    window.editNote = editNote;
    window.deleteNote = deleteNote;

    // Initialize the app
    initApp();
});

// Electron update handlers (if applicable)
if (typeof window.electronAPI !== 'undefined') {
    window.electronAPI.onUpdateAvailable((event, { latestVersion }) => {
        const updateText = document.getElementById('update-text');
        const updateDiv = document.getElementById('update-message');

        updateText.textContent = `Update available: Version ${latestVersion} is ready!`;
        updateDiv.style.display = 'flex';  
    });

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('dismiss-update')?.addEventListener('click', () => {
            document.getElementById('update-message').style.display = 'none';
        });
    });
}