var chai = require('chai');
var expect = chai.expect;
var server = require('../../logic/server');

describe('Server operations', function () {
    it('User should be able to join a new session', function () {
        server.joinSession(100);
        expect(server.userQueue.length).to.equal(1);
        expect(typeof server.activeUsers[100]).to.not.equal('undefined');
    });

    it('A new game session should be created', function (done) {
        for (var i = 1; i < server.minNumPlayers; i++) {
            server.joinSession(i);
            expect(server.activeUsers[i]).to.not.equal('undefined');
        }
        console.log(server.userQueue);
        expect(server.userQueue.length).to.equal(0);
        done();
    });
});
