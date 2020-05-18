const { db } = require('../../../shared');

const roles = require('../../roles');
const deleteModes = require('../../delete-modes');

const deletionUserRulesByRole = {

    [roles.ROLE_PARENT]: [
        {
            modelName: db.names.parentStudent.modelName,
            fieldName: 'parent',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.parentStudentInvitation.modelName,
            fieldName: 'parent',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.parentFile.modelName,
            fieldName: 'user',
            deleteFiles: true,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.parentNote.modelName,
            fieldName: 'user',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        }
    ],

    [roles.ROLE_STUDENT]: [
        {
            modelName: db.names.parentStudent.modelName,
            fieldName: 'student',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.parentStudentInvitation.modelName,
            fieldName: 'student',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.studentFile.modelName,
            fieldName: 'user',
            deleteFiles: true,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.classStudent.modelName,
            fieldName: 'user',
            deleteFiles: false,
            deleteMode: deleteModes.REMOVE
        },
        {
            modelName: db.names.classStudentInvitation.modelName,
            fieldName: 'user',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.studentNote.modelName,
            fieldName: 'user',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        }
    ],

    [roles.ROLE_TEACHER]: [
        {
            modelName: db.names.teacherFile.modelName,
            fieldName: 'user',
            deleteFiles: true,
            deleteMode: deleteModes.DELETE_MANY
        },
        {
            modelName: db.names.class.modelName,
            fieldName: 'user',
            deleteFiles: false,
            deleteMode: deleteModes.REMOVE
        },
        {
            modelName: db.names.teacherNote.modelName,
            fieldName: 'user',
            deleteFiles: false,
            deleteMode: deleteModes.DELETE_MANY
        }
    ]

};

module.exports = deletionUserRulesByRole;
