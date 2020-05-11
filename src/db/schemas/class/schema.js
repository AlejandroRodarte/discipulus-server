const { Schema, model } = require('mongoose');

const classDefinition = require('./definition');
const names = require('../../names');

const roleTypes = require('../../../util/roles');

const schemaOpts = {
    collection: names.class.collectionName
};

const classSchema = new Schema(classDefinition, schemaOpts);

classSchema.index({ user: 1, title: 1 }, { unique: true });

classSchema.methods.checkAndSave = async function() {

    const clazz = this;
    const User = model(names.user.modelName);

    const teacher = await User.findOne({
        _id: clazz.user,
        enabled: true
    });

    if (!teacher) {
        throw new Error('The user has its account deleted/disabled');
    }

    const isTeacher = await teacher.hasRole(roleTypes.ROLE_TEACHER);

    if (!isTeacher) {
        throw new Error('The owner for this class should be a teacher');
    }

    try {
        await clazz.save();
    } catch (e) {
        throw e;
    }

    return clazz;

};

module.exports = classSchema;
