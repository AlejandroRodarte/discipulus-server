const { generateFakeFile } = require('../../functions/models');

const { user, userFile } = require('../../../../src/db/names');

const persisted = require('./persisted');

const persistedUsers = persisted[user.modelName];

const usersFiles = [
    
    // 0. persisted user[0] with another file
    {
        user: persistedUsers[0]._id,
        file: generateFakeFile()
    }

];

module.exports = {
    [userFile.modelName]: usersFiles
};