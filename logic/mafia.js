'use strict';

var messages = require('./messages');
var rolemanager = require('./rolemanager');

var names = ['Peyton', 'Sam', 'Alex', 'Morgan', 'Taylor', 'Carter', 'Jessie'];


var dayDuration = 9000; // 90000
var votingDuration = 9000; // 30000
var nightDuration = 9000; // 30000
// WARNING: Change timeouts to real values. REFACTOR BY CREATING VARIABLES.

var aliveUsers = function (users) {
    var alive = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].state === 'alive') {
            alive.push(users[i]);
        }
    }
    return alive;
};

var getUserFromId = function (session, userId) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        if (userId === users[i].id) {
            return users[i];
        }
    }
    return null;
};

var hasAlreadyVoted = function (session, userId) {
    var property = String(userId);
    return typeof session.voteTally[userId] !== 'undefined';
};

var beforeVotePhase = function (session) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        users[i].vote = 0;
    }
    session.voteTally = {};
    session.votedUser = {};
};

var calculateQuorum = function (users) {
    var alive = aliveUsers(session.users);
    var numUsers = alive.length;
    var min = numUsers / 2;
    var quorum = (numUsers % 2 == 0) ? min : min + 1;
    return quorum;
};

var afterVotePhase = function (session) {
    if (typeof session.votedUser.name !== 'undefined') {
        messages.broadcastText(session.users, user.votedUser.name + " has been lynched");
        return;
    }
    messages.broadcastText(session.users, "No one was lynched");
};

var vote = function (session, userId, toWhom) {
    if (userId === toWhom) {
        messages.sendText(userId, "You can't vote for yourself");
        return;
    }
    console.log("First Equality Passed");

    if (hasAlreadyVoted(session, userId)) {
        messages.sendText(userId, "You can't vote twice!");
        return;
    }
    console.log("Second Equality Passed");
    if (session.state !== 'voting') {
        messages.sendText(userId, "It's no longer the voting phase");
    }
    console.log("Third Equality Passed");

    session.voteTally[userId] = true;
    console.log("Tally Passed");
    var currentUser = getUserFromId(session, userId);
    console.log("Got Current User");
    var targetUser = getUserFromId(session, toWhom);
    console.log("Get Target User");
    targetUser.vote += 1;
    console.log("Added vote to target User");
    var quorum = calculateQuorum(aliveUsers(session.users));
    console.log("Quorum calculated");
    if (targetUser.vote >= quorum) {
        session.votedUser = targetUser;
        targetUser.state = 'dead';
    }
    console.log("If superated");
    messages.broadcastText(session.users, `${currentUser.name} has voted for ${targetUser.name}`);
};

var beforeNightPhase = function (session) {
    session.nightActions = [];
};

var afterNightPhase = function (session) {
    var actions = session.nightActions;
    for (var i = 0; i < actions.length; i++) {
        if (typeof actions[i] !== 'undefined') {
            actions[i]();
        }
    }
};

var checkNightPhase = function (session, userId) {
    if (session.state !== 'night') {
        messages.sendText('It is no longer the night phase');
        return false;
    }
    return true;
};

var gameAction = function (session, properties) {
    switch (properties.action) {
        case 'vote':
            console.log('voting switch');
            vote(session, properties.from, properties.to);
            break;
        default: // A special skill used in the night phase.
            console.log('default switch');
            if (checkNightPhase(session, properties.from)) {
                rolemanager.nightAction(session, properties);
            }
            break;
    }
};

var nightTime = function (session) {
    beforeNightPhase(session);
    session.state = 'night';
    var alive = aliveUsers(session.users);
    messages.broadcastNightAction(session.sessionId, session.dayCount, alive);
    setTimeout(function () {
        afterNightPhase(session);
        gameStates(session);
    }, nightDuration);
};

var votingTime = function (session) {
    beforeVotePhase(session);
    session.state = 'voting';
    var alive = aliveUsers(session.users);
    messages.broadcastVoting(session.sessionId, session.dayCount, alive);
    setTimeout(function () {
        afterVotePhase(session);
        nightTime(session);
    }, votingDuration);
};

var dayTime = function (session) {
    session.dayCount -= 1;
    session.state = 'day';
    messages.broadcastDay(session.users);
    setTimeout(function () {
        votingTime(session);
    }, dayDuration);
};

var finishGame = function (session) {
    session.state = 'finished';
};

var gameStates = function (session) {
    if (session.dayCount === 0) {
        finishGame(session);
        return;
    }
    dayTime(session);
};

var getRandomInt = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

var assignRoles = function (users) {
    var roles = rolemanager.getRoleNames();
    for (var i = 0; i < users.length; i++) {
        users[i].name = names[i];
        users[i].role = roles.splice(getRandomInt(0, roles.length - 1), 1)[0];
        users[i].state = 'alive';
        users[i].vote = 0;
    }
};

var startGame = function (session) {
    assignRoles(session.users);
    messages.broadcastRoles(session.users);
    gameStates(session);
};

var mafia = {
    names: names,
    dayDuration: dayDuration,
    nightDuration: nightDuration,
    votingDuration: votingDuration,
    aliveUsers: aliveUsers,
    getUserFromId: getUserFromId,
    hasAlreadyVoted: hasAlreadyVoted,
    beforeVotePhase: beforeVotePhase,
    calculateQuorum: calculateQuorum,
    afterVotePhase: afterVotePhase,
    vote: vote,
    beforeNightPhase: beforeNightPhase,
    checkNightPhase: checkNightPhase,
    gameAction: gameAction,
    nightTime: nightTime,
    votingTime: votingTime,
    dayTime: dayTime,
    finishGame: finishGame,
    gameStates: gameStates,
    getRandomInt: getRandomInt,
    assignRoles: assignRoles,
    startGame: startGame
};

module.exports = mafia;
