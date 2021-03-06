const { storage } = require('../../../api');

const generateCommonSaveFileAndDoc = ({ modelName, validate }) => async function(buffer) {

    const fileDoc = this;

    try {
        await validate(fileDoc);
        await fileDoc.save();
    } catch (e) {
        throw e;
    }

    try {
        await storage.createMultipartObject(storage.config.bucketNames[modelName], {
            keyname: fileDoc.file.keyname,
            buffer,
            size: buffer.length,
            mimetype: fileDoc.file.mimetype
        });
    } catch (e) {
        await fileDoc.remove();
        throw e;
    }

    return fileDoc;

};

module.exports = generateCommonSaveFileAndDoc;