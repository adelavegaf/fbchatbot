var chai = require('chai');
var expect = chai.expect;
var mafia = require('../../logic/mafia');

describe('Mafia User Getters: ', function () {
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

    it('A user with userId 1 must exist', function () {
        expect(typeof mafia.getUserFromId(session, 1)).to.not.equal('undefined');
    });

    it('There should be 3 dead users', function () {
        var dead = mafia.getDeadUsers(session.users);
        expect(dead.length).to.equal(3);
    });

    it('There should be 4 alive users', function () {
        var alive = mafia.getAliveUsers(session.users);
        expect(alive.length).to.equal(4);
    });

    it('There should be 4 users in town', function () {
        var townUsers = mafia.getUsersInTown(session.users);
        expect(townUsers.length).to.equal(4);
    });

    it('There should be 3 users in the mafia', function () {
        var mafiaUsers = mafia.getUsersInMafia(session.users);
        expect(mafiaUsers.length).to.equal(3);
    });
});

describe('Game logic: ', function () {
    var totalDuration = mafia.dayDuration + mafia.nightDuration + mafia.votingDuration + 1000;
    this.timeout(totalDuration);

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
            dayCount: 1,
            state: 'connecting',
            users: users,
            sessionId: 1
        };
    });


    it(`All users should have a role, name, state and vote`, function () {
        var users = session.users;
        mafia.assignRoles(users);
        for (var i = 0; i < users.lenth; i++) {
            expect(typeof users[i].name).to.not.equal('undefined');
            expect(typeof users[i].role).to.not.equal('undefined');
            expect(typeof users[i].state).to.equal('alive');
            expect(typeof users[i].vote).to.equal(0);
        }
    });

    it(`Game should have ended in a draw`, function () {
        session.dayCount = 0;
        expect(mafia.checkGameEnd(session)).to.equal(true);
        expect(session.state).to.equal('finished');
    });

    it(`Mafia should've won the game`, function () {
        var users = session.users;
        mafia.assignRoles(users);
        var onlyMafia = mafia.getUsersInMafia(users);
        session.users = onlyMafia;
        expect(mafia.checkGameEnd(session)).to.equal(true);
        expect(session.state).to.equal('finished');
    });

    it(`Town should've won the game`, function () {
        var users = session.users;
        mafia.assignRoles(users);
        var onlyTown = mafia.getUsersInTown(users);
        session.users = onlyTown;
        expect(mafia.checkGameEnd(session)).to.equal(true);
        expect(session.state).to.equal('finished');
    });

    it(`Game should not be over`, function () {
        var users = session.users;
        mafia.assignRoles(users);
        expect(mafia.checkGameEnd(session)).to.equal(false);
    });

    it('gameAction: nightActions array should have 7 elements', function () {
        session.nightActions = [];
        session.state = 'night';
        var users = session.users;
        mafia.assignRoles(users);
        var properties = {};
        for (var i = 0; i < users.length; i++) {
            properties.action = users[i].role;
            properties.from = users[i].id;
            properties.to = 1;
            mafia.gameAction(session, properties);
        }
        expect(session.nightActions.length).to.equal(session.users.length);
    });

    it(`Game should be on night phase`, function () {
        session.state = 'night';
        expect(mafia.checkNightPhase(session, 1)).to.equal(true);
    });

    it('Before night phase: nightActions array should be empty', function () {
        mafia.beforeNightPhase(session);
        expect(session.nightActions.length).to.equal(0);
    });

    it('User should not be allowed to vote. Not in vote phase.', function () {
        mafia.assignRoles(session.users);
        mafia.beforeVotePhase(session);
        var users = session.users;
        for (var i = 0; i < users.length; i++) {
            expect(users[i].vote).to.equal(0);
        }
        var countTally = 0;
        for (var property in session.voteTally) {
            if (session.voteTally.hasOwnProperty(property)) {
                countTally++;
            }
        }
        expect(countTally).to.equal(0);
        var countUser = 0;
        for (var property in session.votedUser) {
            if (session.votedUser.hasOwnProperty(property)) {
                countUser++;
            }
        }
        expect(countUser).to.equal(0);
    });

    it('Quorum should be calculated as half the users + 1', function () {
        mafia.assignRoles(session.users);
        var quorum = mafia.calculateQuorum(session.users);
        expect(quorum).to.equal(4);
    });

    it('User has already voted', function () {
        mafia.assignRoles(session.users);
        mafia.beforeVotePhase(session);
        session.state = 'voting';
        mafia.vote(session, 1, 2);
        expect(mafia.hasAlreadyVoted(session, 1)).to.equal(true);
    });

    it('User should not be allowed to vote. Not in vote phase.', function () {
        mafia.assignRoles(session.users);
        var couldVote = mafia.vote(session, 1, 2);
        expect(couldVote).to.equal(false);
    });

    it('User should not be allowed to vote for himself.', function () {
        mafia.assignRoles(session.users);
        session.state = 'voting';
        var couldVote = mafia.vote(session, 1, 1);
        expect(couldVote).to.equal(false);
    });

    it('User should not be allowed to vote twice.', function () {
        mafia.assignRoles(session.users);
        mafia.beforeVotePhase(session);
        session.state = 'voting';
        mafia.vote(session, 1, 2);
        var couldVote = mafia.vote(session, 1, 3);
        expect(couldVote).to.equal(false);
    });

    it('User should be allowed to vote.', function () {
        mafia.assignRoles(session.users);
        mafia.beforeVotePhase(session);
        session.state = 'voting';
        var couldVote = mafia.vote(session, 1, 2);
        expect(couldVote).to.equal(true);
    });

    it('User should be lynched through voting', function () {
        mafia.assignRoles(session.users);
        mafia.beforeVotePhase(session);
        session.state = 'voting';
        mafia.vote(session, 1, 2);
        mafia.vote(session, 3, 2);
        mafia.vote(session, 4, 2);
        mafia.vote(session, 5, 2);
        var votedUser = session.users[1];
        expect(votedUser).to.equal(session.votedUser);
        expect(votedUser.state).to.equal('dead');
    });

    it('A user should have been lynched in afterVotePhase', function () {
        mafia.assignRoles(session.users);
        mafia.beforeVotePhase(session);
        session.state = 'voting';
        mafia.vote(session, 1, 2);
        mafia.vote(session, 3, 2);
        mafia.vote(session, 4, 2);
        mafia.vote(session, 5, 2);
        var lynched = mafia.afterVotePhase(session);
        expect(lynched).to.equal(true);
    });

    it('A user should not have been lynched in afterVotePhase', function () {
        mafia.assignRoles(session.users);
        mafia.beforeVotePhase(session);
        session.state = 'voting';
        var lynched = mafia.afterVotePhase(session);
        expect(lynched).to.equal(false);
    });

    it(`Game states changing correctly`, function (done) {
        var users = session.users;
        mafia.assignRoles(users);
        mafia.gameStates(session);
        expect(session.dayCount).to.equal(0);
        expect(session.state).to.equal('day');
        setTimeout(function () {
            expect(session.state).to.equal('voting');
            setTimeout(function () {
                expect(session.state).to.equal('night');
                done();
            }, mafia.votingDuration + 100);
        }, mafia.dayDuration + 100);
    });
});
