
const { Schema } = require('mongoose');

const { db } = require('../../../shared');
const { errors, models } = require('../../../util');

const homeworkStudentNoteDefinition = require('./definition');

const schemaOpts = {
    collection: db.names.homeworkStudentNote.collectionName
};

const homeworkStudentNoteSchema = new Schema(homeworkStudentNoteDefinition, schemaOpts);

homeworkStudentNoteSchema.index({ homeworkStudent: 1, 'note.title': 1 }, { unique: true });

homeworkStudentNoteSchema.methods.getTaskValidationData = models.common.generateGetTaskValidationData({
    child: {
        collectionName: db.names.homeworkStudent.collectionName,
        ref: 'homeworkStudent'
    },
    grandChild: {
        collectionName: db.names.homework.collectionName,
        ref: 'homework'
    }
});

homeworkStudentNoteSchema.methods.checkAndSave = models.common.generateSimpleCheckAndSave(models.common.generateTaskValidator({
    alreadyCompleteErrorMessage: errors.modelErrorMessages.homeworkAlreadyComplete,
    expiredErrorMessage: errors.modelErrorMessages.homeworkExpired,
    notAvailableErrorMessage: errors.modelErrorMessages.homeworkNotPublished
}));

module.exports = homeworkStudentNoteSchema;