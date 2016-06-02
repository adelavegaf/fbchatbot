'use strict';

var messages = require('./messages');
var rolemanager = require('./rolemanager');

var names = ['Peyton', 'Sam', 'Alex', 'Morgan', 'Taylor', 'Carter', 'Jessie'];

var startGameDelay = 6000;
var gameDuration = 11;
var dayDuration = 15000; // 90000
var votingDuration = 15000; // 30000
var nightDuration = 15000; // 30000
// WARNING: Change timeouts to real values. REFACTOR BY CREATING VARIABLES.

var getUsersByAlliance = function (users, alliance) {
    var usersByAlliance = [];
    for (var i = 0; i < users.length; i++) {
        var role = rolemanager.getRole(users[i].role);
        if (role.alliance === alliance) {
            usersByAlliance.push(users[i]);
        }
    }
    return usersByAlliance;
};

var getUsersByState = function (users, state) {
    var usersWithState = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].state === state) {
            usersWithState.push(users[i]);
        }
    }
    return usersWithState;
};

var getUsersInMafia = function (users) {
    return getUsersByAlliance(users, 'mafia');
};

var getAliveUsers = function (users) {
    return getUsersByState(users, 'alive');
};

var getDeadUsers = function (users) {
    return getUsersByState(users, 'dead');
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
    var alive = getAliveUsers(users);
    var numUsers = alive.length;
    var quorum = numUsers / 2 + 1;
    return quorum;
};

var afterVotePhase = function (session) {
    if (typeof session.votedUser.name !== 'undefined') {
        messages.broadcastText(session.users, session.votedUser.name + " has been lynched");
        return;
    }
    messages.broadcastText(session.users, "No one was lynched");
};

var vote = function (session, userId, toWhom) {
    if (userId === toWhom) {
        messages.sendText(userId, "You can't vote for yourself");
        return;
    }

    if (hasAlreadyVoted(session, userId)) {
        messages.sendText(userId, "You can't vote twice!");
        return;
    }
    if (session.state !== 'voting') {
        messages.sendText(userId, "It's no longer the voting phase");
    }

    session.voteTally[userId] = true;
    var currentUser = getUserFromId(session, userId);
    var targetUser = getUserFromId(session, toWhom);
    targetUser.vote += 1;

    var quorum = calculateQuorum(session.users);

    if (targetUser.vote >= quorum) {
        session.votedUser = targetUser;
        targetUser.state = 'dead';
    }
    messages.broadcastText(session.users, `${currentUser.name} has voted for ${targetUser.name} ${targetUser.vote}/${quorum}`);
};

var beforeNightPhase = function (session) {
    session.nightActions = [];
};

var afterNightPhase = function (session) {
    var actions = session.nightActions;
    for (var i = 0; i < actions.length; i++) {
        if (typeof actions[i] !== 'undefined') {
            actions[i](messages, session.users);
        }
    }
    var users = session.users;
    for (i = 0; i < users.length; i++) {
        if (users[i].state !== 'dead') {
            users[i].state = 'alive';
        }
    }
};

var checkNightPhase = function (session, userId) {
    if (session.state !== 'night') {
        messages.sendText(userId, 'It is no longer the night phase');
        return false;
    }
    return true;
};

var gameAction = function (session, properties) {
    switch (properties.action) {
        case 'vote':
            vote(session, properties.from, properties.to);
            break;
        default: // A special skill used in the night phase.
            if (checkNightPhase(session, properties.from)) {
                properties.to = getUserFromId(session, properties.to);
                properties.from = getUserFromId(session, properties.from);
                rolemanager.nightAction(session, properties);
            }
            break;
    }
};

var speak = function (session, userId, text) {
    var user = getUserFromId(session, userId);
    text = user.name + ": " + text;
    var combinedState = user.state + " " + session.state;
    switch (combinedState) {
        case 'dead day':
        case 'dead voting':
        case 'dead night':
            var users = getDeadUsers(session.users);
            messages.broadcastLimited(userId, users, text);
            break;
        case 'alive day':
            messages.broadcastLimited(userId, session.users, text);
            break;
        case 'alive night':
            var role = rolemanager.getRole(user.role);
            if (role.alliance === 'mafia') {
                var users = getUsersInMafia(session.users);
                messages.broadcastLimited(userId, users, text);
            }
            break;
    };
};

var nightPhase = function (session) {
    beforeNightPhase(session);
    session.state = 'night';
    var alive = getAliveUsers(session.users);
    messages.broadcastNightAction(session.sessionId, session.dayCount, alive);
    setTimeout(function () {
        afterNightPhase(session);
        gameStates(session);
    }, nightDuration);
};

var votingPhase = function (session) {
    beforeVotePhase(session);
    session.state = 'voting';
    var alive = getAliveUsers(session.users);
    messages.broadcastVoting(session.sessionId, session.dayCount, alive);
    setTimeout(function () {
        afterVotePhase(session);
        nightPhase(session);
    }, votingDuration);
};

var dayPhase = function (session) {
    session.dayCount -= 1;
    session.state = 'day';
    messages.broadcastDay(session.users, session.dayCount);
    setTimeout(function () {
        votingPhase(session);
    }, dayDuration);
};

var checkGameEnd = function (session) {
    if (session.dayCount === 0) {
        session.state = 'finished';
        messages.broadcastText(session.users, 'The game has finished in a draw, there are no more turns left.');
        return true;
    }
    var alive = getAliveUsers(session.users);
    var alliance = (alive.length === 0) ? 'No one' : rolemanager.getRole(alive[0].role).alliance;
    for (var i = 1; i < alive.length; i++) {
        var curAlliance = rolemanager.getRole(alive[i].role).alliance;
        if (curAlliance !== alliance) {
            return false;
        }
    }
    session.state = 'finished';
    messages.broadcastText(session.users, `${alliance} has won!`);
    return true;
};

var gameStates = function (session) {
    if (!checkGameEnd(session)) {
        dayPhase(session);
    }
};

var getRandomInt = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

var sendRoleInfo = function (session, userId) {
    var user = getUserFromId(session, userId);
    messages.sendRoleInfo(userId, user.role, user.name);
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
    setTimeout(function () {
        gameStates(session);
    }, startGameDelay);
};

var mafia = {
    names: names,
    startGameDelay: startGameDelay,
    gameDuration: gameDuration,
    dayDuration: dayDuration,
    nightDuration: nightDuration,
    votingDuration: votingDuration,
    getUsersByAlliance: getUsersByAlliance,
    getUsersByState: getUsersByState,
    getUsersInMafia: getUsersInMafia,
    getAliveUsers: getAliveUsers,
    getDeadUsers: getDeadUsers,
    getUserFromId: getUserFromId,
    hasAlreadyVoted: hasAlreadyVoted,
    beforeVotePhase: beforeVotePhase,
    calculateQuorum: calculateQuorum,
    afterVotePhase: afterVotePhase,
    vote: vote,
    beforeNightPhase: beforeNightPhase,
    checkNightPhase: checkNightPhase,
    gameAction: gameAction,
    speak: speak,
    nightPhase: nightPhase,
    votingPhase: votingPhase,
    dayPhase: dayPhase,
    checkGameEnd: checkGameEnd,
    gameStates: gameStates,
    getRandomInt: getRandomInt,
    sendRoleInfo: sendRoleInfo,
    assignRoles: assignRoles,
    startGame: startGame
};

module.exports = mafia;
