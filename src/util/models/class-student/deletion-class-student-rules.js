const { db } = require('../../../shared');

const deleteModes = require('../../delete-modes');

const deletionClassStudentRules = [
    {
        modelName: db.names.classStudentFile.modelName,
        fieldName: 'classStudent',
        deleteFiles: true,
        deleteMode: deleteModes.DELETE_MANY
    },
    {
        modelName: db.names.classStudentNote.modelName,
        fieldName: 'classStudent',
        deleteFiles: false,
        deleteMode: deleteModes.DELETE_MANY
    },
    {
        modelName: db.names.sessionStudent.modelName,
        fieldName: 'classStudent',
        deleteFiles: false,
        deleteMode: deleteModes.REMOVE
    },
    {
        modelName: db.names.homeworkStudent.modelName,
        fieldName: 'classStudent',
        deleteFiles: false,
        deleteMode: deleteModes.REMOVE
    }
];

module.exports = deletionClassStudentRules;
