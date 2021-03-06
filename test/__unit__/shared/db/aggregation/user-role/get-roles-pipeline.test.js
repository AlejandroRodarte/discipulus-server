const { Types } = require('mongoose');
const expect = require('chai').expect;

const { aggregation } = require('../../../../../../src/shared/db');

describe('[shared/db/aggregation/user-role] - getRolesPipeline', () => {

    it('Should return proper pipeline object', () => {

        const userId = new Types.ObjectId();
        const pipeline = aggregation.userRolePipelines.getRolesPipeline(userId);

        expect(pipeline.length).to.equal(4);

        const [firstStage] = pipeline;
        expect(firstStage.$match.user).to.equal(userId);

    });

});
