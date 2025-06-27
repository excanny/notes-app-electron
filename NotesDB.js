
class NotesDB {
    constructor(dbName = 'NotesApp', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Database initialization timeout'));
            }, 10000);

            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                clearTimeout(timeout);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                clearTimeout(timeout);
                this.db = request.result;
                
                this.db.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                };
                
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('notes')) {
                    const store = db.createObjectStore('notes', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('updated_at', 'updated_at', { unique: false });
                }
            };

            request.onblocked = () => {
                clearTimeout(timeout);
                reject(new Error('Database blocked - please close other tabs'));
            };
        });
    }

    async getAllNotes() {
        this._checkInitialized();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Get all notes timeout'));
            }, 5000);

            try {
                const transaction = this.db.transaction(['notes'], 'readonly');
                const store = transaction.objectStore('notes');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    clearTimeout(timeout);
                    const notes = request.result || [];
                    notes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                    resolve(notes);
                };
                
                request.onerror = () => {
                    clearTimeout(timeout);
                    reject(request.error);
                };

                transaction.onerror = () => {
                    clearTimeout(timeout);
                    reject(transaction.error);
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    async saveNote(note) {
        this._checkInitialized();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Save note timeout'));
            }, 5000);

            try {
                const transaction = this.db.transaction(['notes'], 'readwrite');
                const store = transaction.objectStore('notes');
                
                const now = new Date().toISOString();
                if (!note.id) {
                    note.created_at = now;
                }
                note.updated_at = now;
                
                const request = store.put(note);
                
                request.onsuccess = () => {
                    clearTimeout(timeout);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    clearTimeout(timeout);
                    reject(request.error);
                };

                transaction.onerror = () => {
                    clearTimeout(timeout);
                    reject(transaction.error);
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    async deleteNote(id) {
        this._checkInitialized();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Delete note timeout'));
            }, 5000);

            try {
                const transaction = this.db.transaction(['notes'], 'readwrite');
                const store = transaction.objectStore('notes');
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                
                request.onerror = () => {
                    clearTimeout(timeout);
                    reject(request.error);
                };

                transaction.onerror = () => {
                    clearTimeout(timeout);
                    reject(transaction.error);
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    async getNote(id) {
        this._checkInitialized();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Get note timeout'));
            }, 5000);

            try {
                const transaction = this.db.transaction(['notes'], 'readonly');
                const store = transaction.objectStore('notes');
                const request = store.get(id);
                
                request.onsuccess = () => {
                    clearTimeout(timeout);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    clearTimeout(timeout);
                    reject(request.error);
                };

                transaction.onerror = () => {
                    clearTimeout(timeout);
                    reject(transaction.error);
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    async searchNotes(query) {
        this._checkInitialized();
        
        const allNotes = await this.getAllNotes();
        const searchQuery = query.toLowerCase();
        
        return allNotes.filter(note => 
            note.title.toLowerCase().includes(searchQuery) || 
            note.content.toLowerCase().includes(searchQuery)
        );
    }

    async getNotesCount() {
        this._checkInitialized();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Get notes count timeout'));
            }, 5000);

            try {
                const transaction = this.db.transaction(['notes'], 'readonly');
                const store = transaction.objectStore('notes');
                const request = store.count();
                
                request.onsuccess = () => {
                    clearTimeout(timeout);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    clearTimeout(timeout);
                    reject(request.error);
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    async exportNotes() {
        const notes = await this.getAllNotes();
        return JSON.stringify(notes, null, 2);
    }

    async importNotes(jsonString) {
        try {
            const notes = JSON.parse(jsonString);
            if (!Array.isArray(notes)) {
                throw new Error('Invalid JSON format: expected array of notes');
            }

            let importedCount = 0;
            for (const note of notes) {
                // Remove ID to create new notes, preserving original timestamps
                const { id, ...noteData } = note;
                await this.saveNote(noteData);
                importedCount++;
            }

            return importedCount;
        } catch (error) {
            throw new Error(`Import failed: ${error.message}`);
        }
    }

    async clearAllNotes() {
        this._checkInitialized();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Clear all notes timeout'));
            }, 5000);

            try {
                const transaction = this.db.transaction(['notes'], 'readwrite');
                const store = transaction.objectStore('notes');
                const request = store.clear();
                
                request.onsuccess = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                
                request.onerror = () => {
                    clearTimeout(timeout);
                    reject(request.error);
                };
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    _checkInitialized() {
        if (!this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }
    }
}

export default NotesDB;