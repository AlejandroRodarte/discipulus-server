const expect = require('chai').expect;

const User = require('../../../../src/db/models/user');

const { userDefinition } = require('../../../../src/db/schemas/user');

const modelFunctions = require('../../../__fixtures__/functions/models');

const userDoc = {
    name: 'Alejandro Rodarte',
    username: 'rodarte8850',
    email: 'alejandrorodarte1@gmail.com',
    password: '$2y$08$uWMdVxKxs6tM72uzFM4cWOyJlpJNZPqHwwu0YMXQLgBvlMdjEo1wa',
    tokens: [
        'my-super-token'
    ],
    avatar: {
        originalname: 'this is my file.pdf',
        mimetype: 'application/pdf',
        keyname: '710b962e-041c-11e1-9234-0123456789ab.pdf'
    }
};

let user = new User(userDoc);

beforeEach(() => user = modelFunctions.getNewModelInstance(User, userDoc));

describe('Invalid user names', () => {

    const [userMinLength] = userDefinition.name.minlength;
    const [userMaxLength] = userDefinition.name.maxlength;

    it('Should not validate a user without a name', () => {
        user.name = undefined;
        modelFunctions.testForInvalidModel(user, userDefinition.name.required);
    });

    it('Should not validate a user with a name that does not match the fullName regexp pattern', () => {
        user.name = 'Max+ User!';
        modelFunctions.testForInvalidModel(user, userDefinition.name.validate);
    });

    it('Should not validate a user with a name that does not match the singleName regexp pattern', () => {
        user.name = '.Peter';
        modelFunctions.testForInvalidModel(user, userDefinition.name.validate);
    });

    it('Should not validate a user with an explicit profane name', () => {
        user.name = 'Pussy Destroyer';
        modelFunctions.testForInvalidModel(user, userDefinition.name.validate);
    });

    it('Should not validate a user with an implicit profane name', () => {
        user.name = 'Matthew Cumblast';
        modelFunctions.testForInvalidModel(user, userDefinition.name.validate);
    });

    it(`Should not validate a user with a name shorter than ${ userMinLength } characters`, () => {
        user.name = 'A';
        modelFunctions.testForInvalidModel(user, userDefinition.name.minlength);
    });

    it(`Should not validate a user with a name longer than ${ userMaxLength } characters`, () => {
        user.name = 'Hey this is a reaaaaaaallllyyy looooong super name that should not enter into the database ever since its pretty long you now';
        modelFunctions.testForInvalidModel(user, userDefinition.name.maxlength);
    });

});

describe('Valid user names', () => {

    it('Should validate a correct user name', () => {
        user.name = 'Brian O\' Connor';
        modelFunctions.testForValidModel(user);
    });

    it('Should trim a valid user name', () => {

        user.name = '   John        Smith    ';
        modelFunctions.testForValidModel(user);

        expect(user.name).to.equal('John Smith');

    });

});

describe('Invalid user usernames', () => {

    const [usernameMinLength] = userDefinition.username.minlength;
    const [usernameMaxLength] = userDefinition.username.maxlength;

    it('Should not validate a user without a username', () => {
        user.username = undefined;
        modelFunctions.testForInvalidModel(user, userDefinition.username.required);
    });

    it('Should not validate a user with a username that does not match the username regexp pattern', () => {
        user.username = 'max+!';
        modelFunctions.testForInvalidModel(user, userDefinition.username.validate);
    });

    it('Should not validate a user with a profane username', () => {
        user.username = 'colossalanus';
        modelFunctions.testForInvalidModel(user, userDefinition.username.validate);
    });

    it(`Should not validate a user with a username shorter than ${ usernameMinLength } characters`, () => {
        user.username = 'cz';
        modelFunctions.testForInvalidModel(user, userDefinition.username.minlength);
    });

    it(`Should not validate a user with a username longer than ${ usernameMaxLength } characters`, () => {
        user.username = 'superlongusernamebruh';
        modelFunctions.testForInvalidModel(user, userDefinition.username.maxlength);
    });

});

describe('Valid user usernames', () => {

    it('Should validate a correct username', () => {
        user.username = 'lion_delta42';
        modelFunctions.testForValidModel(user);
    });

    it('Should trim a valid username', () => {

        user.username = '   magician.red_68     ';
        modelFunctions.testForValidModel(user);

        expect(user.username).to.equal('magician.red_68');

    });

});

describe('Invalid user emails', () => {

    it('Should not validate a user without an email', () => {
        user.email = undefined;
        modelFunctions.testForInvalidModel(user, userDefinition.email.required);
    });

    it('Should not validate a user with an invalid email', () => {
        user.email = 'this-is@not-an@email.com';
        modelFunctions.testForInvalidModel(user, userDefinition.email.validate);
    });

});

describe('Valid user emails', () => {

    it('Should validate a correct email', () => {
        user.email = 'john_smith@hotmail.com';
        modelFunctions.testForValidModel(user);
    });

    it('Should trim a valid email', () => {

        user.email = '   smith@something.org     ';
        modelFunctions.testForValidModel(user);

        expect(user.email).to.equal('smith@something.org');

    });

});

describe('Invalid user passwords', () => {

    const [passwordMinLength] = userDefinition.password.minlength;
    const [passwordMaxLength] = userDefinition.password.maxlength;

    it('Should not validate a user without a password', () => {
        user.password = undefined;
        modelFunctions.testForInvalidModel(user, userDefinition.password.required);
    });

    it(`Should not validate a user with a password shorter than ${ passwordMinLength } characters (unhashed)`, () => {
        user.password = 'this-is-an-unhashed-password';
        modelFunctions.testForInvalidModel(user, userDefinition.password.minlength);
    });

    it(`Should not validate a user with a password longer than ${ passwordMaxLength } characters (unhashed)`, () => {
        user.password = 'really-long-password-that-is-not-actually-hashed-with-bcrypt-so-it-should-fail';
        modelFunctions.testForInvalidModel(user, userDefinition.password.maxlength);
    });

});

describe('Valid user passwords', () => {

    it('Should validate a correct password', () => {
        user.password = '$2y$12$r2ey63ZhWsufGBHhnK8Y4uAxUQrGGdxOwETEa7NtVdZJCyWn6yrnW';
        modelFunctions.testForValidModel(user);
    });

});

describe('User avatar', () => {

    it('Should validate a correctly defined file schema', () => {
        modelFunctions.testForValidModel(user);
    });

    it('Should validate a user without a defined file schema', () => {
        user.avatar = undefined;
        modelFunctions.testForValidModel(user);
    });

});
