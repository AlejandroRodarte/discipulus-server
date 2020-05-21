const { Schema } = require('mongoose');

const { db } = require('../../../shared');
const { models, errors } = require('../../../util');

const sessionStudentDefinition = require('./definition');
const applyDeletionRules = require('../../apply-deletion-rules');

const schemaOpts = {
    collection: db.names.sessionStudent.collectionName
};

const sessionStudentSchema = new Schema(sessionStudentDefinition, schemaOpts);

sessionStudentSchema.index({ classStudent: 1, session: 1 }, { unique: true });

sessionStudentSchema.virtual('files', {
    ref: db.names.sessionStudentFile.modelName,
    localField: '_id',
    foreignField: 'sessionStudent'
});

sessionStudentSchema.virtual('notes', {
    ref: db.names.sessionStudentNote.modelName,
    localField: '_id',
    foreignField: 'sessionStudent'
});

sessionStudentSchema.pre('remove', async function() {

    const sessionStudent = this;

    try {
        await applyDeletionRules(sessionStudent, models.sessionStudent.deletionSessionStudentRules);
    } catch {
        throw e;
    }

});

sessionStudentSchema.methods.checkAndSave = models.common.generateClassStudentChildCheckAndSave({
    foreignModel: {
        name: db.names.session.modelName,
        ref: 'session',
        notFoundErrorMessage: errors.modelErrorMessages.sessionNotFound
    }
});

module.exports = sessionStudentSchema;