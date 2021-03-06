const { Schema } = require('mongoose');
const moment = require('moment');

const { db } = require('../../../shared');
const { models, errors } = require('../../../util');

const homeworkStudentDefinition = require('./definition');
const applyDeletionRules = require('../../apply-deletion-rules');

const schemaOpts = {
    collection: db.names.homeworkStudent.collectionName
};

const homeworkStudentSchema = new Schema(homeworkStudentDefinition, schemaOpts);

homeworkStudentSchema.index({ classStudent: 1, homework: 1 }, { unique: true });

homeworkStudentSchema.virtual('files', {
    ref: db.names.homeworkStudentFile.modelName,
    localField: '_id',
    foreignField: 'homeworkStudent'
});

homeworkStudentSchema.virtual('notes', {
    ref: db.names.homeworkStudentNote.modelName,
    localField: '_id',
    foreignField: 'homeworkStudent'
});

homeworkStudentSchema.virtual('sections', {
    ref: db.names.homeworkStudentSection.modelName,
    localField: '_id',
    foreignField: 'homeworkStudent'
});

homeworkStudentSchema.pre('save', async function() {

    const homeworkStudent = this;

    if (homeworkStudent.isModified('directGrade')) {

        const Homework = homeworkStudent.model(db.names.homework.modelName);

        const homework = await Homework.findOne({
            _id: homeworkStudent.homework
        });

        if (!homework) {
            throw new Error(errors.modelErrorMessages.homeworkNotFound);
        }

        if (homework.type === db.models.class.gradeType.SECTIONS) {
            throw new Error(errors.modelErrorMessages.homeworkSectionMisjudgement);
        }

    }

});

homeworkStudentSchema.pre('remove', async function() {

    const homeworkStudent = this;

    try {
        applyDeletionRules(homeworkStudent, models.homeworkStudent.deletionHomeworkStudentRules);
    } catch (e) {
        throw e;
    }

});

homeworkStudentSchema.methods.checkAndSave = models.common.generateClassChildCheckAndSave({
    local: {
        modelName: db.names.classStudent.modelName,
        ref: 'classStudent',
        notFoundErrorMessage: errors.modelErrorMessages.classStudentNotFound
    },
    foreign: {
        modelName: db.names.homework.modelName,
        ref: 'homework',
        notFoundErrorMessage: errors.modelErrorMessages.homeworkNotFound
    },
    validate: async (classStudent, homework, homeworkStudent) => {

        const isStudentEnabled = await classStudent.isStudentEnabled();

        if (!isStudentEnabled) {
            throw new Error(errors.modelErrorMessages.userDisabled);
        }

        if (!homework.published) {
            throw new Error(errors.modelErrorMessages.homeworkNotPublished);
        }

        if (!homeworkStudent.forced && (homework.timeRange && homework.timeRange.end && moment().utc().unix() > homework.timeRange.end)) {
            throw new Error(errors.modelErrorMessages.homeworkExpired);
        }

    }
});

homeworkStudentSchema.methods.getDetailsForStudent = async function() {

    const homeworkStudent = this;
    const HomeworkStudent = homeworkStudent.constructor;

    const pipeline = db.aggregation.homeworkStudentPipelines.getDetailsForStudent(homeworkStudent._id);
    const docs = await HomeworkStudent.aggregate(pipeline);

    if (!docs.length) {
        throw new Error(errors.modelErrorMessages.homeworkStudentNotFound);
    }

    const [details] = docs;

    return details;

};

homeworkStudentSchema.methods.getDetailsForTeacher = async function() {

    const homeworkStudent = this;
    const HomeworkStudent = homeworkStudent.constructor;

    const pipeline = db.aggregation.homeworkStudentPipelines.getDetailsForTeacher(homeworkStudent._id);
    const docs = await HomeworkStudent.aggregate(pipeline);

    if (!docs.length) {
        throw new Error(errors.modelErrorMessages.homeworkStudentNotFound);
    }

    const [details] = docs;

    return details;

};

module.exports = homeworkStudentSchema;