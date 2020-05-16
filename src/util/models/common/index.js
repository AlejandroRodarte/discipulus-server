const generateFilePreRemove = require('./generate-file-pre-remove');
const generateSaveFileAndDoc = require('./generate-save-file-and-doc');
const generateUserFileRoleValidator = require('./generate-user-file-role-validator');
const generateRegularFileValidator = require('./generate-regular-file-validator');
const generateNoteCheckAndSave = require('./generate-note-check-and-save');

module.exports = {
    generateFilePreRemove,
    generateSaveFileAndDoc,
    generateUserFileRoleValidator,
    generateRegularFileValidator,
    generateNoteCheckAndSave
};
