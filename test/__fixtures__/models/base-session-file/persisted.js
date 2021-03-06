const { Types } = require('mongoose');

const { models, util } = require('../../functions');

const { db } = require('../../../../src/shared');

const sessions = [
    // 0: sample session
    ...util.generateOneToMany('class', new Types.ObjectId(), [ models.generateFakeSession() ])
];

const sessionFiles = [
    // 0-1: session[0] with two files
    ...util.generateOneToMany('session', sessions[0]._id, [{ file: models.generateFakeFile() }, { file: models.generateFakeFile() }])
];

module.exports = {
    [db.names.session.modelName]: sessions,
    [db.names.sessionFile.modelName]: sessionFiles
};
