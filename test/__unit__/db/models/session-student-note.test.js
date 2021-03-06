const { Types } = require('mongoose');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const db = require('../../../../src/db');
const shared = require('../../../../src/shared');
const api = require('../../../../src/api');
const util = require('../../../../src/util');
const fixtures = require('../../../__fixtures__');

const expect = chai.expect;
chai.use(chaiAsPromised);

const [sessionStudentNoteDoc] = fixtures.functions.util.generateOneToMany('sessionStudent', new Types.ObjectId(), [{ note: fixtures.functions.models.generateFakeNote() }]);
let sessionStudentNote = new db.models.SessionStudentNote(sessionStudentNoteDoc);

beforeEach(() => sessionStudentNote = fixtures.functions.models.getNewModelInstance(db.models.SessionStudentNote, sessionStudentNoteDoc));

describe('[db/models/session-student-note] - Invalid sessionStudent _id', () => {

    it('Should not validate if sessionStudent _id is undefined', () => {
        sessionStudentNote.sessionStudent = undefined;
        fixtures.functions.models.testForInvalidModel(sessionStudentNote, db.schemas.definitions.sessionStudentNoteDefinition.sessionStudent.required);
    });

});

describe('[db/models/session-student-note] - Invalid note', () => {

    it('Should not validate if note is undefined', () => {
        sessionStudentNote.note = undefined;
        fixtures.functions.models.testForInvalidModel(sessionStudentNote, db.schemas.definitions.sessionStudentNoteDefinition.note.required);
    });

});

describe('[db/models/session-student-note] - valid model', () => {

    it('Should validate correct model', () => {
        fixtures.functions.models.testForValidModel(sessionStudentNote);
    });

});

describe('[db/models/session-student-note] - methods.checkAndSave', () => {

    let sessionStudentExistsStub;
    let sessionNoteSaveStub;

    it('Generated function should call methods with correct args and return session-student-note doc', async () => {

        sessionStudentExistsStub = sinon.stub(db.models.SessionStudent, 'exists').resolves(true);
        sessionNoteSaveStub = sinon.stub(sessionStudentNote, 'save').resolves(sessionStudentNote);

        await expect(sessionStudentNote.checkAndSave()).to.eventually.eql(sessionStudentNote);

        sinon.assert.calledOnceWithExactly(sessionStudentExistsStub, {
            _id: sessionStudentNote.sessionStudent
        });

        sinon.assert.calledOnce(sessionNoteSaveStub);

    });

    afterEach(() => {
        sinon.restore();
    });

});
