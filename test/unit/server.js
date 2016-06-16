var chai = require('chai');
var expect = chai.expect;
var server = require('../../logic/server');
var mafia = require('../../logic/mafia');

describe('Server operations', function () {
    var totalDuration = mafia.startGameDelay + 2000;
    this.timeout(totalDuration);

    beforeEach(function () {
        server.resetServer();
    });

    it('The user should be found in the array', function () {
        var session = {
            users: [{
                id: 1
            }, {
                id: 2
            }]
        };
        var index = server.getSessionId(session, 1);
        expect(index).to.equal(0);
    });

    it('The user should be allowed to join a session', function () {
        server.joinSession(1, 'facebook');
        expect(server.getActiveUsers()[1]).to.not.equal('undefined');
        expect(server.getSessions()[0]).to.not.equal('undefined');
        expect(server.getSessions()[0].state).to.equal('connecting');
        expect(server.getSessions()[0].dayCount).to.equal(mafia.gameDuration);
    });

    it('The user should not be allowed to join a game session', function () {
        server.joinSession(1, 'facebook');
        expect(server.joinSession(1, 'facebook')).to.equal(false);
    });

    it('The user should not be able to exit a game', function () {
        expect(server.exit(1)).to.equal(false);
    });

    it('The user should be able to exit a game', function () {
        server.joinSession(1, 'facebook');
        expect(server.exit(1)).to.equal(true);
        expect(server.getActiveUsers()[1]).to.equal(undefined);
        var session = server.getSessions()[0];
        var users = session.users;
        for (var i = 0; i < users.length; i++) {
            expect(users[i].id).to.not.equal(1);
        }
    });

    it('should not send role info to a user that is not on a game', function () {
        expect(server.role(1)).to.equal(false);
    });

    it('should send role info to a user that is on a game', function () {
        server.joinSession(1, 'facebook');
        var userQueue = server.getUserQueue();
        userQueue[0].role = 'Doctor';
        userQueue[0].name = 'test';
        expect(server.role(1)).to.equal(true);
    });


    it('should not send alive info to a user that is not on a game', function () {
        expect(server.alive(1)).to.equal(false);
    });

    it('should send alive info to a user that is on a game', function () {
        server.joinSession(1, 'facebook');
        var userQueue = server.getUserQueue();
        userQueue[0].role = 'Doctor';
        userQueue[0].name = 'test';
        userQueue[0].state = 'alive';
        expect(server.alive(1)).to.equal(true);
    });

    it('should not send dead info to a user that is not on a game', function () {
        expect(server.dead(1)).to.equal(false);
    });

    it('should send alive info to a user that is on a game', function () {
        server.joinSession(1, 'facebook');
        var userQueue = server.getUserQueue();
        userQueue[0].role = 'Doctor';
        userQueue[0].name = 'test';
        userQueue[0].state = 'dead';
        expect(server.dead(1)).to.equal(true);
    });

    it('should not be able to delete a non-existent session', function () {
        expect(server.cleanSession(0)).to.equal(false);
    });

    it('should be able to delete a existent session', function () {
        server.joinSession(1, 'facebook');
        expect(server.cleanSession(0)).to.equal(true);
        expect(typeof server.getSessions()[0]).to.equal('undefined');
        expect(typeof server.getActiveUsers()[1]).to.equal('undefined');
    });

    it('The user does not have an active session', function () {
        expect(server.hasActiveSession(1)).to.equal(false);
    });

    it('The user does have an active session', function () {
        server.joinSession(1, 'facebook');
        expect(server.hasActiveSession(1)).to.equal(true);
    });

    it('The users current session is finished', function () {
        server.joinSession(1, 'facebook');
        server.getSessions()[0].state = 'finished';
        expect(server.hasActiveSession(1)).to.equal(false);
        expect(typeof server.getSessions()[0]).to.equal('undefined');
        expect(typeof server.getActiveUsers()[1]).to.equal('undefined');
    });

    it('Action stamp should be invalid: sessionId does not correspond', function () {
        server.joinSession(1, 'facebook');
        expect(server.verifyActionStamp(1, 1, 11)).to.equal(false);
    });

    it('Action stamp should be invalid: dayCount does not correspond', function () {
        server.joinSession(1, 'facebook');
        expect(server.verifyActionStamp(1, 0, 8)).to.equal(false);
    });

    it('Action stamp should be invalid: user is not in a session', function () {
        expect(server.verifyActionStamp(1, 0, 11)).to.equal(false);
    });

    it('Action stamp should be valid', function () {
        server.joinSession(1, 'facebook');
        expect(server.verifyActionStamp(1, 0, 11)).to.equal(true);
    });

    it('User should not be able to call a gameAction. Not in a game.', function () {
        expect(server.callGameAction(1, ['', '', '', ''])).to.equal(false);
    });

    it('User should not be able to call a gameAction. invalid action stamp', function () {
        server.joinSession(1, 'facebook');
        expect(server.callGameAction(1, ['Doctor', '1', '0', '12'])).to.equal(false);
    });

    it('User should be able to call a gameAction. invalid action stamp', function () {
        server.joinSession(1, 'facebook');
        expect(server.callGameAction(1, ['norole', '1', '0', '11'])).to.equal(true);
    });

    it('The user should join a session using a payload that contains join', function () {
        expect(server.parsePayload(1, 'join')).to.equal(true);
        expect(server.getActiveUsers()[1]).to.not.equal('undefined');
        expect(server.getSessions()[0]).to.not.equal('undefined');
        expect(server.getSessions()[0].state).to.equal('connecting');
        expect(server.getSessions()[0].dayCount).to.equal(mafia.gameDuration);
    });

    it('The user should exit a session using a payload that contains exit', function () {
        server.joinSession(1, 'facebook');
        expect(server.parsePayload(1, 'exit')).to.equal(true);
        expect(server.getActiveUsers()[1]).to.equal(undefined);
        var session = server.getSessions()[0];
        var users = session.users;
        for (var i = 0; i < users.length; i++) {
            expect(users[i].id).to.not.equal(1);
        }
    });

    it('The user should  cast an action using a valid action payload', function () {
        server.joinSession(1, 'facebook');
        expect(server.parsePayload(1, 'norole;1;0;11')).to.equal(true);
    });
    /**
     * Should be the last test to be executed due to the callback.
     */
    it('A new game session should be created', function (done) {
        for (var i = 0; i < server.minNumPlayers; i++) {
            server.joinSession(i, 'facebook');
            if (i === 0) {
                server.getSessions()[0].dayCount = 0;
            }
            expect(server.getActiveUsers()[i]).to.not.equal('undefined');
        }
        setTimeout(function () {
            expect(server.getUserQueue().length).to.equal(0);
            done();
        }, mafia.startGameDelay + 1000);
    });
});
