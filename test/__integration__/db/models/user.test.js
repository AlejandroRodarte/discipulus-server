const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const { mongo, Error } = require('mongoose');

const { 
    User, 
    UserRole, 
    ParentStudent,
    UserFile,
    ParentFile,
    StudentFile,
    TeacherFile,
    ParentStudentInvitation,
    UserEvent,
    Class
} = require('../../../../src/db/models');

const { 
    uniqueUserContext, 
    baseUserRoleContext, 
    baseParentStudentContext,
    baseUserFileContext,
    baseStudentFileContext,
    baseParentFileContext,
    baseTeacherFileContext,
    baseParentStudentInvitationContext,
    baseUserEventContext,
    baseClassContext
} = require('../../../__fixtures__/models');

const { userAvatarContext, removeAllUserFilesContext } = require('../../../__fixtures__/models-storage');

const db = require('../../../__fixtures__/functions/db');
const dbStorage = require('../../../__fixtures__/functions/db-storage');

const getAssetBuffer = require('../../../__fixtures__/functions/assets/get-asset-buffer');

const { user, userFile, parentFile, teacherFile, studentFile } = require('../../../../src/db/names');

const storageApi = require('../../../../src/api/storage');
const bucketNames = require('../../../../src/api/storage/config/bucket-names');

const roleTypes = require('../../../../src/util/roles');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('[db/models/user] - uniqueUser context', () => {

    beforeEach(db.init(uniqueUserContext.persisted));

    const persistedUser = uniqueUserContext.persisted[user.modelName][0];
    const persistedUserId = persistedUser._id;

    const uniqueUserDoc = uniqueUserContext.unpersisted[user.modelName][0];

    describe('[db/models/user] - Non-unique names', () => {

        const nonUniqueUserDoc = uniqueUserContext.unpersisted[user.modelName][1];

        it('Should persist a user with a non-unique name', async () => {
            const user = new User(nonUniqueUserDoc);
            await expect(user.save()).to.eventually.be.eql(user);
        });
    
    });
    
    describe('[db/models/user] - Non-unique usernames', () => {
    
        const nonUniqueUserDoc = uniqueUserContext.unpersisted[user.modelName][2];

        it('Should not persist a user with a non-unique username', async () => {
            const duplicateUser = new User(nonUniqueUserDoc);
            await expect(duplicateUser.save()).to.eventually.be.rejectedWith(mongo.MongoError);
        });
    
    });
    
    describe('[db/models/user] - Non-unique emails', () => {
    
        const nonUniqueUserDoc = uniqueUserContext.unpersisted[user.modelName][3];

        it('Should not persist a user with a non-unique email', async () => {
            const duplicateUser = new User(nonUniqueUserDoc);
            await expect(duplicateUser.save()).to.eventually.be.rejectedWith(mongo.MongoError);
        });
    
    });
    
    describe('[db/models/user] - Unique username and email', () => {

        it('Should persist a user with a required unique fields', async () => {
            const user = new User(uniqueUserDoc);
            await expect(user.save()).to.eventually.be.eql(user);
        });
    
    });
    
    describe('[db/models/user] - Pre save hook', () => {

        it('Should persist a user with a hashed password', async () => {
    
            const user = await User.findOne({ _id: persistedUserId });
    
            expect(user.password.length).to.equal(60);
            expect(user.password).to.not.equal(persistedUser.password);
    
        });
    
    });

    afterEach(db.teardown(uniqueUserContext.persisted));

});

describe('[db/models/user] - baseUserRole context', () => {

    beforeEach(db.init(baseUserRoleContext.persisted));

    const persistedUserId = baseUserRoleContext.persisted[user.modelName][0]._id;

    describe('[db/models/user] - Pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        it('Should remove user-role association upon user deletion', async () => {

            const user = await User.findOne({ _id: persistedUserId });
            await user.remove();

            const userRoleDocCount = await UserRole.countDocuments({
                user: persistedUserId
            });

            expect(userRoleDocCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    describe('[db/models/user] - methods.getUserRoles', () => {

        const users = baseUserRoleContext.persisted[user.modelName];

        const userTwoId = users[1]._id;
        const userThreeId = users[2]._id;

        it('Should return an array of rolenames on user with roles', async () => {

            const user = await User.findOne({ _id: userTwoId });
            const roles = await user.getUserRoles();

            expect(roles.length).to.equal(2);

            const [roleOne, roleTwo] = roles;

            expect(roleOne).to.equal(roleTypes.ROLE_ADMIN);
            expect(roleTwo).to.equal(roleTypes.ROLE_PARENT);

        });

        it ('Should return an empty array on user without roles', async () => {

            const user = await User.findOne({ _id: userThreeId });
            const roles = await user.getUserRoles();

            expect(roles.length).to.equal(0);

        });

    });

    describe('[db/models/user] - methods.hasRole', () => {

        const users = baseUserRoleContext.persisted[user.modelName];

        const userOneId = users[0]._id;
        const userTwoId = users[2]._id;

        it('Should return true on user that has a role', async () => {

            const user = await User.findOne({ _id: userOneId });
            const hasRole = await user.hasRole(roleTypes.ROLE_ADMIN);

            expect(hasRole).to.equal(true);

        });

        it('Should return false on user that does not have a role', async () => {

            const user = await User.findOne({ _id: userTwoId });
            const hasRole = await user.hasRole(roleTypes.ROLE_STUDENT);

            expect(hasRole).to.equal(false);

        });

    });

    afterEach(db.teardown(baseUserRoleContext.persisted));

});

describe('[db/models/user] - baseParentStudent context', () => {

    beforeEach(db.init(baseParentStudentContext.persisted));

    const persisted = baseParentStudentContext.persisted;

    describe('[db/models/user] - Pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const persistedUsers = persisted[user.modelName];

        it('Should delete associated parentStudent records upon student user deletion', async () => {
            
            const userSevenId = persistedUsers[6]._id;
            const userSeven = await User.findOne({ _id: userSevenId });

            await userSeven.remove();

            const docCount = await ParentStudent.countDocuments({
                student: userSevenId
            });

            expect(docCount).to.equal(0);

        });

        it('Should delete associated parentStudent records upon parent deletion', async () => {

            const userSixId = persistedUsers[5]._id;
            const userSix = await User.findOne({ _id: userSixId });

            await userSix.remove();

            const docCount = await ParentStudent.countDocuments({
                parent: userSixId
            });

            expect(docCount).to.equal(0);

        });

        it('Should delete associated parentStudent records upon user that is both a student and a parent', async () => {

            const userFiveId = persistedUsers[4]._id;
            const userFive = await User.findOne({ _id: userFiveId });

            await userFive.remove();

            const parentDocCount = await ParentStudent.countDocuments({
                parent: userFiveId
            });

            const studentDocCount = await ParentStudent.countDocuments({
                student: userFiveId
            });

            expect(parentDocCount).to.equal(0);
            expect(studentDocCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseParentStudentContext.persisted));

});

describe('[db/models/user] - baseParentStudentInvitation context', () => {

    beforeEach(db.init(baseParentStudentInvitationContext.persisted));

    describe('[db/models/user] - Pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const persistedUsers = baseParentStudentInvitationContext.persisted[user.modelName];

        it('Should delete associated parentStudentInvitation records upon parent user deletion', async () => {

            const userOneId = persistedUsers[0]._id;

            const user = await User.findOne({ _id: userOneId });
            await user.remove();

            const docCount = await ParentStudentInvitation.countDocuments({
                parent: userOneId
            });

            expect(docCount).to.equal(0);

        });

        it('Should delete associated parentStudentInvitation records upon student user deletion', async () => {

            const userSevenId = persistedUsers[6]._id;

            const user = await User.findOne({ _id: userSevenId });
            await user.remove();

            const docCount = await ParentStudentInvitation.countDocuments({
                student: userSevenId
            });

            expect(docCount).to.equal(0);

        });

        it('Should delete associated parentStudentInvitation records upon user deletion that is both student and parent', async () => {

            const userFiveId = persistedUsers[4]._id;

            const user = await User.findOne({ _id: userFiveId });
            await user.remove();

            const parentDocCount = await ParentStudentInvitation.countDocuments({
                parent: userFiveId
            });

            const studentDocCount = await ParentStudentInvitation.countDocuments({
                student: userFiveId
            });

            expect(parentDocCount).to.equal(0);
            expect(studentDocCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseParentStudentInvitationContext.persisted));

});

describe('[db/models/user] - baseUserFile context', () => {

    beforeEach(db.init(baseUserFileContext.persisted));

    const persistedUsers = baseUserFileContext.persisted[user.modelName];

    describe('[db/models/user] - Pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const userId = persistedUsers[0]._id;

        it('Should delete all associated user files upon user deletion', async () => {

            const user = await User.findOne({ _id: userId });

            await user.remove();

            const docCount = await UserFile.countDocuments({
                user: userId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseUserFileContext.persisted));

});

describe('[db/models/user] - baseParentFile context', () => {

    beforeEach(db.init(baseParentFileContext.persisted));

    const persistedUsers = baseParentFileContext.persisted[user.modelName];

    describe('[db/models/user] - Pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const parentId = persistedUsers[0]._id;

        it('Should delete all associated parent files upon user deletion (with parent role)', async () => {

            const parent = await User.findOne({ _id: parentId });

            await parent.remove();

            const docCount = await ParentFile.countDocuments({
                user: parentId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseParentFileContext.persisted));

});

describe('[db/models/user] - baseStudentFile context', () => {

    beforeEach(db.init(baseStudentFileContext.persisted));

    const persistedUsers = baseStudentFileContext.persisted[user.modelName];

    describe('[db/models/user] - Pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const studentId = persistedUsers[0]._id;

        it('Should delete all associated student files upon user deletion (with student role)', async () => {

            const student = await User.findOne({ _id: studentId });

            await student.remove();

            const docCount = await StudentFile.countDocuments({
                user: studentId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseStudentFileContext.persisted));

});

describe('[db/models/user] - baseTeacherFile context', () => {

    beforeEach(db.init(baseTeacherFileContext.persisted));

    const persistedUsers = baseTeacherFileContext.persisted[user.modelName];

    describe('[db/models/user] - Pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const teacherId = persistedUsers[0]._id;

        it('Should delete all associated teacher files upon user deletion (with teacher role)', async () => {

            const teacher = await User.findOne({ _id: teacherId });

            await teacher.remove();

            const docCount = await TeacherFile.countDocuments({
                user: teacherId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseTeacherFileContext.persisted));

});

describe('[db/models/user] - userAvatar context', function() {

    this.timeout(20000);

    this.beforeEach(dbStorage.init(userAvatarContext.persisted));

    const persistedUsers = userAvatarContext.persisted.db[user.modelName];
    const persistedAvatars = userAvatarContext.persisted.storage[user.modelName];

    const unpersistedAvatars = userAvatarContext.unpersisted.storage[user.modelName];

    describe('[db/models/user] - methods.saveAvatar', () => {

        it('Should throw error if a user attempt to save an avatar that is not a valid image', async () => {

            const documentFile = unpersistedAvatars[0];
            const buffer = getAssetBuffer(documentFile.originalname);

            const userOneId = persistedUsers[0]._id;
            const userOne = await User.findOne({ _id: userOneId });

            await expect(userOne.saveAvatar(documentFile, buffer)).to.eventually.be.rejectedWith(Error.ValidationError);

        });

        it('Should allow a user with no avatar to save an avatar properly if its of the correct type', async () => {

            const avatarFile = unpersistedAvatars[1];
            const buffer = getAssetBuffer(avatarFile.originalname);

            const userOneId = persistedUsers[0]._id;
            const userOne = await User.findOne({ _id: userOneId });

            await expect(userOne.saveAvatar(avatarFile, buffer)).to.eventually.be.eql(userOne);

            const res = await storageApi.getMultipartObject(bucketNames[user.modelName], userOne.avatar.keyname);

            expect(res.buffer).to.eql(buffer);
            expect(res.contentType).to.equal(userOne.avatar.mimetype);

        });

        it('Should allow a user with avatar to replace it with another one', async () => {

            const avatarFile = unpersistedAvatars[1];
            const buffer = getAssetBuffer(avatarFile.originalname);

            const userTwoId = persistedUsers[1]._id;
            const userTwo = await User.findOne({ _id: userTwoId });

            await expect(userTwo.saveAvatar(avatarFile, buffer)).to.eventually.be.eql(userTwo);

            const bucketKeys = await storageApi.listBucketKeys(bucketNames[user.modelName]);

            const oldAvatarKeyname = persistedAvatars[0].keyname;

            expect(bucketKeys.length).to.equal(1);
            expect(bucketKeys).to.not.include(oldAvatarKeyname);

            const res = await storageApi.getMultipartObject(bucketNames[user.modelName], userTwo.avatar.keyname);

            expect(res.buffer).to.eql(buffer);
            expect(res.contentType).to.equal(userTwo.avatar.mimetype);

        });

    });

    this.afterEach(dbStorage.teardown(userAvatarContext.persisted));

});

describe('[db/models/user] - removeAllUserFiles context', function() {

    this.timeout(20000);

    this.beforeEach(dbStorage.init(removeAllUserFilesContext.persisted));

    const persistedUsers = removeAllUserFilesContext.persisted.db[user.modelName];

    describe('[db/models/user] - pre remove hook', () => {

        it('Should remove all associated files on user removal', async () => {

            const userId = persistedUsers[0]._id;
            const userToDelete = await User.findOne({ _id: userId });

            await expect(userToDelete.remove()).to.eventually.be.fulfilled;

            const avatarKeys = await storageApi.listBucketKeys(bucketNames[user.modelName]);
            const userFileKeys = await storageApi.listBucketKeys(bucketNames[userFile.modelName]);
            const parentFileKeys = await storageApi.listBucketKeys(bucketNames[parentFile.modelName]);
            const studentFileKeys = await storageApi.listBucketKeys(bucketNames[studentFile.modelName]);
            const teacherFileKeys = await storageApi.listBucketKeys(bucketNames[teacherFile.modelName]);

            expect(avatarKeys.length).to.equal(0);
            expect(userFileKeys.length).to.equal(0);
            expect(parentFileKeys.length).to.equal(0);
            expect(studentFileKeys.length).to.equal(0);
            expect(teacherFileKeys.length).to.equal(0);

        });

    });

    this.afterEach(dbStorage.teardown(removeAllUserFilesContext.persisted));

});

describe('[db/models/user] - baseUserEvent context', () => {

    beforeEach(db.init(baseUserEventContext.persisted));

    describe('[db/models/user] - pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const persistedUsers = baseUserEventContext.persisted[user.modelName];

        it('Should delete all associated user events upon user deletion', async () => {

            const userId = persistedUsers[0]._id;
            const user = await User.findOne({ _id: userId });

            await user.remove();
            
            const docCount = await UserEvent.countDocuments({
                user: userId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseUserEventContext.persisted));

});

describe('[db/models/user] - baseClass context', () => {

    beforeEach(db.init(baseClassContext.persisted));

    describe('[db/models/user] - pre remove hook', () => {

        let deleteBucketObjectsStub;

        beforeEach(() => {
            deleteBucketObjectsStub = sinon.stub(storageApi, 'deleteBucketObjects').resolves();
        });

        const persistedUsers = baseClassContext.persisted[user.modelName];

        it('Should delete all associated classes upon user deletion', async () => {

            const userId = persistedUsers[2]._id;
            const user = await User.findOne({ _id: userId });

            await user.remove();
            
            const docCount = await Class.countDocuments({
                user: userId
            });

            expect(docCount).to.equal(0);

        });

        afterEach(() => {
            sinon.restore();
        });

    });

    afterEach(db.teardown(baseUserEventContext.persisted));

});
