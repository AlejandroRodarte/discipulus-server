const names = require('../../../db/names');
const deleteModes = require('../../delete-modes');

const deletionClassStudentRules = [
    {
        modelName: names.classStudentFile.modelName,
        fieldName: 'classStudent',
        deleteFiles: true,
        deleteMode: deleteModes.DELETE_MANY
    }
];

module.exports = deletionClassStudentRules;