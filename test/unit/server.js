var chai = require('chai');
var expect = chai.expect;
var server = require('../../logic/server');

describe('Server operations', function () {

    it('join should add a person to the pending array', function (done) {
        server.join(123);
        expect(server.pending.length).to.equal(1);
        done();
    });

    it('should have no users in the pending array', function (done) {
        server.join(123);
        server.join(234);
        server.join(421);
        server.join(149);
        server.join(400);
        server.join(1400);
        expect(server.pending.length).to.equal(0);
        done();
    });

    it('should have one active session', function (done) {
        expect(server.sessions.length).to.equal(1);
        done();
    });
});
