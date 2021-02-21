const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders')
    },
    getFolderById(knex, folderId) {
        return knex
        .select('*')
        .from('folders')
        .where('id', folderId)
        .first()
    },
    insertFolder(knex, newFolder) {
        return knex
        .into('folders')
        .insert(newFolder)
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },
    deleteFolder(knex, folderId) {
        return knex('folders')
        .where('id', folderId)
        .delete()
    },
    updateFolder(knex, folderId, folderUpdates) {
        return knex('folders')
        .where('id', folderId)
        .update(folderUpdates)
    }
}

module.exports = FoldersService