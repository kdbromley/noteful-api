const path = require('path');
const express = require('express');
//const xss = require('xss')
const NotesService = require('./notes-services')

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
    id: note.id,
    title: xss(note.note_title),
    content: xss(note.content),
    date_created: note.date_created,
    folder: note.folder,
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        let folderId = req.query.folder;
        if(!folderId) {
            NotesService.getAllNotes(
                req.app.get('db')
            )
            .then(notes => {
                res.json(notes)
            })
            .catch(next)
        }
        
        NotesService.getNotesByFolder(
            req.app.get('db'),
            folderId
        )
        .then(notes => {
            res.json(notes)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { note_title, content, folder } = req.body;
        const newNote = { note_title, folder};

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }
        newNote.content = content;

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
        .then(note => {
            res.status(201)
             .location(path.posix.join(req.originalUrl, `/${note.id}`))
             .json(note)
        })
        .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        const noteId = req.params.note_id;
        
        NotesService.getNoteById(
            req.app.get('db'),
            noteId
        )
        .then(note => {
            if(!note) {
                return res.status(404).json({
                    error: {
                        message: `Note doesn't exist.`
                    }
                })
            }
            res.note = note;
            console.log(res.note)
            next();
        })
        .catch(next)
    })
    .get((req, res) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        const noteId = req.params.note_id;
        
        NotesService.deleteNote(
            req.app.get('db'),
            noteId
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { note_title, content, folder } = req.body;
        const noteUpdates = { note_title, content, folder };

        const numberOfValues = Object.values(noteUpdates).filter(Boolean).length;
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'note_title', 'content', or 'folder'.`
                }
            })
        }

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteUpdates
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })



module.exports = notesRouter