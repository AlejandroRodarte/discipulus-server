const { functions } = require('../../../../util');

const sharedNoteDefinition = {

    title: {
        type: String,
        required: [true, 'A note title is required'],
        validate: [
            (value) => !functions.isSentenceProfane(value),
            'Please do not use bad words on your note title'
        ],
        unique: false,
        minlength: [2, 'Note title must be at least 2 characters long'],
        maxlength: [50, 'Note title must not exceed 50 characters'],
        set: (value) => {
            if (value) {
                return functions.trimRedundantSpaces(value);
            }
        }
    },

    description: {
        type: String,
        required: false,
        validate: [
            (value) => !functions.isSentenceProfane(value),
            'Please do not use bad words on your note description'
        ],
        maxlength: [500, 'Note description must not exceed 500 characters'],
        set: (value) => {
            if (value) {
                return functions.trimRedundantSpaces(value);
            }
        }
    },

    markdown: {
        type: String,
        required: [true, 'Please provide markdown content'],
        validate: [
            (value) => !functions.isSentenceProfane(value),
            'Please do not use bad words on your note markdown'
        ],
        minlength: [5, 'Note markdown must be at least 5 characters long'],
        maxlength: [10000, 'Note markdown must not exceed 10000 characters'],
        trim: true
    }

};

module.exports = sharedNoteDefinition;
