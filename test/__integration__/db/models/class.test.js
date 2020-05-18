const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const { mongo, Error: MongooseError } = require('mongoose');

const db = require('../../../../src/db');
const shared = require('../../../../src/shared');
const api = require('../../../../src/api');
const util = require('../../../../src/util');
const fixtures = require('../../../__fixtures__');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('[db/models/class] - uniqueClass context', () => {

    beforeEach(fixtures.functions.db.init(fixtures.models.uniqueClassContext.persisted));

    const unpersistedClasses = fixtures.models.uniqueClassContext.unpersisted[shared.db.names.class.modelName];

    describe('[db/models/class] - Non unique user/title fields', () => {

        it('Should not persist if user/title fields for a class are not unique', async () => {

            const classDoc = unpersistedClasses[0];
            const clazz = new db.models.Class(classDoc);

            await expect(clazz.save()).to.eventually.be.rejectedWith(mongo.MongoError);

        });

    });

    describe('[db/models/class] - Unique user/title fields', () => {

        it('Should persist if user/title fields for a class is unique', async () => {

            const classDoc = unpersistedClasses[1];
            const clazz = new db.models.Class(classDoc);

            await expect(clazz.save()).to.eventually.be.eql(clazz);

        });

    });

    afterEach(fixtures.functions.db.teardown(fixtures.models.uniqueClassContext.persisted));

});

describe('[db/models/class] - baseClass context', () => {

    beforeEach(fixtures.functions.db.init(fixtures.models.baseClassContext.persisted));

    const unpersistedClasses = fixtures.models.baseClassContext.unpersisted[shared.db.names.class.modelName];

    describe('[db/models/class] - methods.checkAndSave', () => {

        it('Should throw error if user is not found', async () => {

            const classDoc = unpersistedClasses[0];
            const clazz = new db.models.Class(classDoc);

            await expect(clazz.checkAndSave()).to.eventually.be.rejectedWith(Error, util.errors.modelErrorMessages.teacherNotFound);

        });

        it('Should throw error if user exists but the account is disabled', async () => {

            const classDoc = unpersistedClasses[1];
            const clazz = new db.models.Class(classDoc);

            await expect(clazz.checkAndSave()).to.eventually.be.rejectedWith(Error, util.errors.modelErrorMessages.teacherNotFound);

        });

        it('Should throw error if class owner is not a user with the teacher role assigned', async () => {

            const classDoc = unpersistedClasses[2];
            const clazz = new db.models.Class(classDoc);

            await expect(clazz.checkAndSave()).to.eventually.be.rejectedWith(Error, util.errors.modelErrorMessages.notATeacher);

        });

        it('Should throw error if class to persist fails validation or unique index requirements', async () => {

            const classDoc = unpersistedClasses[3];
            const clazz = new db.models.Class(classDoc);

            await expect(clazz.checkAndSave()).to.eventually.be.rejectedWith(mongo.MongoError);

        });

        it('Should persist properly a valid class model to an enabled teacher', async () => {

            const classDoc = unpersistedClasses[4];
            const clazz = new db.models.Class(classDoc);

            await expect(clazz.checkAndSave()).to.eventually.be.eql(clazz);

        });

    });

    afterEach(fixtures.functions.db.teardown(fixtures.models.baseClassContext.persisted));

});

describe('[db/models/class] - classAvatar context', function() {

    this.timeout(20000);

    this.beforeEach(fixtures.functions.dbStorage.init(fixtures.modelsStorage.classAvatarContext.persisted));

    const persistedClasses = fixtures.modelsStorage.classAvatarContext.persisted.db[shared.db.names.class.modelName];
    const persistedClassAvatars = fixtures.modelsStorage.classAvatarContext.persisted.storage[shared.db.names.class.modelName];

    const unpersistedClassAvatars = fixtures.modelsStorage.classAvatarContext.unpersisted.storage[shared.db.names.class.modelName];

    describe('[db/models/class] - methods.saveAvatar', () => {

        it('Should throw error if it is attempted to save an invalid avatar', async () => {

            const documentFile = unpersistedClassAvatars[0];
            const buffer = fixtures.functions.assets.getAssetBuffer(documentFile.originalname);

            const classTwoId = persistedClasses[1]._id;
            const classTwo = await db.models.Class.findOne({ _id: classTwoId });

            await expect(classTwo.saveAvatar(documentFile, buffer)).to.eventually.be.rejectedWith(MongooseError.ValidationError);

        });

        it('Should allow class with no avatar to save a new image', async () => {

            const pngImage = unpersistedClassAvatars[1];
            const buffer = fixtures.functions.assets.getAssetBuffer(pngImage.originalname);

            const classTwoId = persistedClasses[1]._id;
            const classTwo = await db.models.Class.findOne({ _id: classTwoId });

            await expect(classTwo.saveAvatar(pngImage, buffer)).to.eventually.be.eql(classTwo);

            const res = await api.storage.getMultipartObject(api.storage.config.bucketNames[shared.db.names.class.modelName], classTwo.avatar.keyname);

            expect(res.buffer).to.eql(buffer);
            expect(res.contentType).to.eql(classTwo.avatar.mimetype);

        });

        it('Should allow class with avatar to replace its avatar with another avatar', async () => {

            const pngImage = unpersistedClassAvatars[1];
            const buffer = fixtures.functions.assets.getAssetBuffer(pngImage.originalname);

            const classOneId = persistedClasses[0]._id;
            const classOne = await db.models.Class.findOne({ _id: classOneId });

            await expect(classOne.saveAvatar(pngImage, buffer)).to.eventually.be.eql(classOne);

            const bucketKeys = await api.storage.listBucketKeys(api.storage.config.bucketNames[shared.db.names.class.modelName]);

            const oldAvatarKeyname = persistedClassAvatars[0].keyname;

            expect(bucketKeys.length).to.equal(1);
            expect(bucketKeys).to.not.include(oldAvatarKeyname);

            const res = await api.storage.getMultipartObject(api.storage.config.bucketNames[shared.db.names.class.modelName], classOne.avatar.keyname);

            expect(res.buffer).to.eql(buffer);
            expect(res.contentType).to.eql(classOne.avatar.mimetype);

        });

    });

    describe('[db/models/class] - pre remove hook', () => {

        it('Should delete class avatar upon class removal', async () => {

            const classOneId = persistedClasses[0]._id;
            const classOne = await db.models.Class.findOne({ _id: classOneId });

            const classOneAvatarKeyname = classOne.avatar.keyname;

            await classOne.remove();

            const bucketKeys = await api.storage.listBucketKeys(api.storage.config.bucketNames[shared.db.names.class.modelName]);
            expect(bucketKeys).to.not.include(classOneAvatarKeyname);

        });

    });

    this.afterEach(fixtures.functions.dbStorage.teardown(fixtures.modelsStorage.classAvatarContext.persisted));

});

describe('[db/models/class] - baseClassStudent context', () => {

    beforeEach(fixtures.functions.db.init(fixtures.models.baseClassStudentContext.persisted));

    describe('[db/models/class] - pre remove hook', () => {

        let deleteBucketObjectsStub;

        const persistedClasses = fixtures.models.baseClassStudentContext.persisted[shared.db.names.class.modelName];
        const classOneId = persistedClasses[0]._id;

        beforeEach(async () => {

            deleteBucketObjectsStub = sinon.stub(api.storage, 'deleteBucketObjects').resolves();

            const clazz = await db.models.Class.findOne({ _id: classOneId });
            await clazz.remove();

        });

        it('Should delete all associated class-student records upon class removal', async () => {

            const docCount = await db.models.ClassStudent.countDocuments({
                class: classOneId
            });

            expect(docCount).to.equal(0);

        });

        it('Should delete all associated class-student-invitation records upon class removal', async () => {

            const docCount = await db.models.ClassStudentInvitation.countDocuments({
                class: classOneId
            });

            expect(docCount).to.equal(0);

        });

        it('Should delete all associated class-unknown-student-invitation records upon class removal', async () => {

            const docCount = await db.models.ClassUnknownStudentInvitation.countDocuments({
                class: classOneId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(fixtures.functions.db.teardown(fixtures.models.baseClassStudentContext.persisted));

});

describe('[db/models/class] - baseClassFile context', () => {

    beforeEach(fixtures.functions.db.init(fixtures.models.baseClassFileContext.persisted));
    
    const persistedClasses = fixtures.models.baseClassFileContext.persisted[shared.db.names.class.modelName];

    describe('[db/models/class] - pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => deleteBucketObjectsStub = sinon.stub(api.storage, 'deleteBucketObjects').resolves());

        it('Should delete all associated class files upon class deletion', async () => {

            const classOneId = persistedClasses[0]._id;
            const clazz = await db.models.Class.findOne({ _id: classOneId });

            await clazz.remove();

            const docCount = await db.models.ClassFile.countDocuments({
                class: classOneId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(fixtures.functions.db.teardown(fixtures.models.baseClassFileContext.persisted));

});

describe('[db/models/class] - baseClassNote context', () => {

    beforeEach(fixtures.functions.db.init(fixtures.models.baseClassNoteContext.persisted));
    
    const persistedClasses = fixtures.models.baseClassNoteContext.persisted[shared.db.names.class.modelName];

    describe('[db/models/class] - pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => deleteBucketObjectsStub = sinon.stub(api.storage, 'deleteBucketObjects').resolves());

        it('Should delete all associated class notes upon class deletion', async () => {

            const classOneId = persistedClasses[0]._id;
            const clazz = await db.models.Class.findOne({ _id: classOneId });

            await clazz.remove();

            const docCount = await db.models.ClassNote.countDocuments({
                class: classOneId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(fixtures.functions.db.teardown(fixtures.models.baseClassNoteContext.persisted));

});

describe('[db/models/class] - removeClassFiles context', function() {

    this.timeout(20000);

    this.beforeEach(fixtures.functions.dbStorage.init(fixtures.modelsStorage.removeClassFilesContext.persisted));

    const persistedClasses = fixtures.modelsStorage.removeClassFilesContext.persisted.db[shared.db.names.class.modelName];
    const persistedStorageClassFiles = fixtures.modelsStorage.removeClassFilesContext.persisted.storage[shared.db.names.classFile.modelName];

    describe('[db/models/class] - pre remove hook', () => {

        it('Should delete actual class-files from storage upon class deletion', async () => {

            const classFileOneKeyname = persistedStorageClassFiles[0].keyname;

            const classOneId = persistedClasses[0]._id;
            const clazzOne = await db.models.Class.findOne({ _id: classOneId });

            await clazzOne.remove();

            const bucketKeys = await api.storage.listBucketKeys(api.storage.config.bucketNames[shared.db.names.classFile.modelName]);

            expect(bucketKeys).to.not.include(classFileOneKeyname);

        });

    });

    this.afterEach(fixtures.functions.dbStorage.teardown(fixtures.modelsStorage.removeClassFilesContext.persisted));

});
