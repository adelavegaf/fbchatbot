var chai = require('chai');
var expect = chai.expect;
var mafia = require('../../logic/mafia');

describe('Mafia Game', function () {
    it('Game start', function (done) {
        var users = [{
            id: 1
        }, {
            id: 1
        }, {
            id: 1
        }, {
            id: 1
        }, {
            id: 1
        }, {
            id: 1
        }, {
            id: 1
        }];
        var session = {
            dayCount: 10,
            state: 'connecting',
            users: users,
            sessionId: 1
        };
        mafia.startGame(session);
        console.log(users);
        expect(users.length).to.equal(7);
    });
});
