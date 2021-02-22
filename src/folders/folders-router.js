const path = require('path');
const express = require('express');
const xss = require('xss')
const FoldersService = require('./folders-services')

const foldersRouter = express.Router();
const jsonParser = express.json();

 sanitizeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name)
})


foldersRouter
    .route('/')
    .get((req, res, next) => {
            FoldersService.getAllFolders(
                req.app.get('db')
            )
            .then(notes => {
                res.json(notes)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { folder_name } = req.body;
        const newFolder = { folder_name };

        if (newFolder == null) {
            return res.status(400).json({
                error: { message: `Missing folder_name in request body` }
            })
        }

        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
        .then(note => {
            res.status(201)
             .location(path.posix.join(req.originalUrl, `/${note.id}`))
             .json(note)
        })
        .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        const folderId = req.params.folder_id;
        
        FoldersService.getFolderById(
            req.app.get('db'),
            folderId
        )
        .then(folder => {
            if(!folder) {
                return res.status(404).json({
                    error: {
                        message: `Folder doesn't exist.`
                    }
                })
            }
            res.folder = folder;
            next();
        })
        .catch(next)
    })
    .get((req, res) => {
        res.json(sanitizeFolder(res.folder))
    })
    .delete((req, res, next) => {
        const folderId = req.params.folder_id;
        
        FoldersService.deleteFolder(
            req.app.get('db'),
            folderId
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { folder_name } = req.body;
        const folderUpdates = { folder_name };

        if(!folderUpdates) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'folder_name'.`
                }
            })
        }

        FoldersService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            folderUpdates
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })



module.exports = foldersRouter