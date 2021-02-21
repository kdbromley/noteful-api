const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    getNotesByFolder(knex, folderId) {
        return knex
        .select('*')
        .from({n: 'notes'})
        .join({f: 'folders'}, 'n.folder', '=', 'f.id')
        .where('f.id', folderId)
    },
    getNoteById(knex, noteId) {
      return knex
        .from('notes')
        .select('*')
        .where('id', noteId)
        .first()
    },
    insertNote(knex, newNote) {
        return knex
        .insert(newNote)
        .into('notes')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },
    deleteNote(knex, noteId) {
        return knex('notes')
        .where('id', noteId)
        .delete()
    },
    updateNote(knex, noteId, updatedNoteFields) {
        return knex('notes')
        .where('id', noteId)
        .update(updatedNoteFields)
    }
}



module.exports = NotesService