const { Types } = require('mongoose');
const faker = require('faker');

const { db } = require('../../../../src/shared');

const persisted = require('./persisted');

const persistedClassUnknownStudentInvitations = persisted[db.names.classUnknownStudentInvitation.modelName];

const classUnknownStudentInvitations = [

    // 0. same class/email combo as classUnknownStudentInvitation[0]
    {
        class: persistedClassUnknownStudentInvitations[0].class,
        email: persistedClassUnknownStudentInvitations[0].email
    },

    // 1. same class, different email
    {
        class: persistedClassUnknownStudentInvitations[0].class,
        email: faker.internet.email()
    },

    // 2. same email, different class
    {
        class: new Types.ObjectId(),
        email: persistedClassUnknownStudentInvitations[0].email
    },

    // 3. different class/email
    {
        class: new Types.ObjectId(),
        email: faker.internet.email()
    }
    
];

module.exports = {
    [db.names.classUnknownStudentInvitation.modelName]: classUnknownStudentInvitations
};
