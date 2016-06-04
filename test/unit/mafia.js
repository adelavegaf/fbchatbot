var chai = require('chai');
var expect = chai.expect;
var mafia = require('../../logic/mafia');

describe('Logic User Getters: ', function () {
    var session = {};
    beforeEach(function () {
        var users = [{
            id: 1,
            name: 'Peyton',
            role: 'Mafia Boss',
            state: 'alive',
            vote: 0
        }, {
            id: 2,
            name: 'Sam',
            role: 'Barman',
            state: 'alive',
            vote: 0
        }, {
            id: 3,
            name: 'Alex',
            role: 'Doctor',
            state: 'alive',
            vote: 0
        }, {
            id: 4,
            name: 'Morgan',
            role: 'Detective',
            state: 'dead',
            vote: 0
        }, {
            id: 5,
            name: 'Taylor',
            role: 'Mafioso',
            state: 'alive',
            vote: 0
        }, {
            id: 6,
            name: 'Carter',
            role: 'Vigilante',
            state: 'dead',
            vote: 0
        }, {
            id: 7,
            name: 'Jessie',
            role: 'Mafioso',
            state: 'dead',
            vote: 0
        }];
        session = {
            dayCount: 11,
            state: 'connecting',
            users: users,
            sessionId: 1
        };
    });

    it('A user with userId 1 must exist', function (done) {
        expect(typeof mafia.getUserFromId(session, 1)).to.not.equal('undefined');
        done();
    });

    it('There should be 3 dead users', function (done) {
        var dead = mafia.getDeadUsers(session.users);
        expect(dead.length).to.equal(3);
        done();
    });

    it('There should be 4 alive users', function (done) {
        var alive = mafia.getAliveUsers(session.users);
        expect(alive.length).to.equal(4);
        done();
    });

    it('There should be 4 users in town', function (done) {
        var townUsers = mafia.getUsersInTown(session.users);
        expect(townUsers.length).to.equal(4);
        done();
    });

    it('There should be 3 users in the mafia', function (done) {
        var mafiaUsers = mafia.getUsersInMafia(session.users);
        expect(mafiaUsers.length).to.equal(3);
        done();
    });

    it('There should be 0 users with the given state', function (done) {
        var ghost = mafia.getUsersByState(session.users, 'ghost');
        expect(ghost.length).to.equal(0);
        done();
    });

    it('There should be 0 users with the given alliance', function (done) {
        var ghost = mafia.getUsersByAlliance(session.users, 'ghost');
        expect(ghost.length).to.equal(0);
        done();
    });
});

describe('Game logic: ', function () {
    var session = {};
    beforeEach(function () {
        var users = [{
            id: 1
        }, {
            id: 2
        }, {
            id: 3
        }, {
            id: 4
        }, {
            id: 5
        }, {
            id: 6
        }, {
            id: 7
        }];
        session = {
            dayCount: 11,
            state: 'connecting',
            users: users,
            sessionId: 1
        };
    });


    it(`All users should have a role, name, state and vote`, function (done) {
        var users = session.users;
        mafia.assignRoles(users);
        for (var i = 0; i < users.lenth; i++) {
            expect(typeof users[i].name).to.not.equal('undefined');
            expect(typeof users[i].role).to.not.equal('undefined');
            expect(typeof users[i].state).to.equal('alive');
            expect(typeof users[i].vote).to.equal(0);
        }
        done();
    });

    it(`Game should have ended in a draw`, function (done) {
        session.dayCount = 0;
        expect(mafia.checkGameEnd(session)).to.equal(true);
        expect(session.state).to.equal('finished');
        done();
    });

    it(`Mafia should've won the game`, function (done) {
        var users = session.users;
        mafia.assignRoles(users);
        var onlyMafia = mafia.getUsersInMafia(users);
        session.users = onlyMafia;
        expect(mafia.checkGameEnd(session)).to.equal(true);
        expect(session.state).to.equal('finished');
        done();
    });

    it(`Town should've won the game`, function (done) {
        var users = session.users;
        mafia.assignRoles(users);
        var onlyTown = mafia.getUsersInTown(users);
        session.users = onlyTown;
        expect(mafia.checkGameEnd(session)).to.equal(true);
        expect(session.state).to.equal('finished');
        done();
    });
});
