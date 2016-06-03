'use strict';

var messages = require('./messages');
var rolemanager = require('./rolemanager');
/**
 * Predefined user alias.
 */
var names = ['Peyton', 'Sam', 'Alex', 'Morgan', 'Taylor', 'Carter', 'Jessie'];

/**
 * Delay to start a game. This is done in order to give
 * users important information that helps them interact with the game.
 */
var startGameDelay = 6000;
/**
 * Number of turns the game lasts.
 */
var gameDuration = 11;
/**
 * Determines the duration of the day phase in a game.
 */
var dayDuration = 15000; // 90000
/**
 * Determines the duration of the voting phase in a game.
 */
var votingDuration = 15000; // 30000
/**
 * Determines the duration of the night phase in a game.
 */
var nightDuration = 15000; // 30000

/**
 * Returns all users who have a given alliance.
 */
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
/**
 * Returns all users who have a given state.
 */
var getUsersByState = function (users, state) {
    var usersWithState = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].state === state) {
            usersWithState.push(users[i]);
        }
    }
    return usersWithState;
};
/**
 * Returns all users whose alliance is 'mafia'.
 */
var getUsersInMafia = function (users) {
    return getUsersByAlliance(users, 'mafia');
};
/**
 * Returns all users whose state is 'alive'.
 */
var getAliveUsers = function (users) {
    return getUsersByState(users, 'alive');
};
/**
 * Returns all users whose state is 'dead'.
 */
var getDeadUsers = function (users) {
    return getUsersByState(users, 'dead');
};
/**
 * Returns a user object from the given userId.
 */
var getUserFromId = function (session, userId) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        if (userId === users[i].id) {
            return users[i];
        }
    }
    return null;
};
/**
 * Determines whether a user has already voted in the
 * current voting phase.
 */
var hasAlreadyVoted = function (session, userId) {
    var property = String(userId);
    return typeof session.voteTally[userId] !== 'undefined';
};
/**
 * Clears past voting counts, tally and lynched user 
 * to start a new voting session. 
 */
var beforeVotePhase = function (session) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        users[i].vote = 0;
    }
    session.voteTally = {};
    session.votedUser = {};
};
/**
 * Calculates the minimum number of votes needed to lynch
 * a player.
 */
var calculateQuorum = function (users) {
    var alive = getAliveUsers(users);
    var numUsers = alive.length;
    var quorum = numUsers / 2 + 1;
    return quorum;
};
/**
 * Tells users if a player was lynched in the voting phase.
 */
var afterVotePhase = function (session) {
    if (typeof session.votedUser.name !== 'undefined') {
        messages.broadcastText(session.users, session.votedUser.name + " has been lynched");
        return;
    }
    messages.broadcastText(session.users, "No one was lynched");
};
/**
 * Handles voting mechanism.
 **/
var vote = function (session, userId, toWhom) {
    if (session.state !== 'voting') {
        messages.sendText(userId, "It's no longer the voting phase");
        return;
    }

    if (userId === toWhom) {
        messages.sendText(userId, "You can't vote for yourself");
        return;
    }

    if (hasAlreadyVoted(session, userId)) {
        messages.sendText(userId, "You can't vote twice!");
        return;
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
/**
 * Clears all the actions that were done on the previous night.
 */
var beforeNightPhase = function (session) {
    session.nightActions = [];
};
/**
 * Executes all of the night abilities that were
 * used the night before.
 */
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
/**
 * Checks if current game is in the night phase.
 */
var checkNightPhase = function (session, userId) {
    if (session.state !== 'night') {
        messages.sendText(userId, 'It is no longer the night phase');
        return false;
    }
    return true;
};
/**
 * Triggers appropiate server response to a user action.
 * Current user actions are voting and night abilities.
 */
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
/**
 * Handles the communication between users taking into account
 * their game state and roles.
 */
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
/**
 * Handles the actions to be taken before the night phase begins.
 * Also, sets timeout to start the day phase.
 */
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
/**
 * Handles the actions to be taken before the voting phase begins.
 * Also, sets timeout to start the night phase.
 */
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
/**
 * Handles the actions to be taken before the day phase begins.
 * Also, sets timeout to start the voting phase.
 */
var dayPhase = function (session) {
    session.dayCount -= 1;
    session.state = 'day';
    messages.broadcastDay(session.users, session.dayCount);
    setTimeout(function () {
        votingPhase(session);
    }, dayDuration);
};
/**
 * Checks if the game has ended, either by draw or because
 * one team won.
 */
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
/**
 * Recursive function that sets timeOuts to handle
 * each game phase.
 */
var gameStates = function (session) {
    if (!checkGameEnd(session)) {
        dayPhase(session);
    }
};
/**
 * Generates a random integer.
 */
var getRandomInt = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};
/**
 * Sends a particular user his game role and alias.
 */
var sendRoleInfo = function (session, userId) {
    var user = getUserFromId(session, userId);
    messages.sendRoleInfo(userId, user.role, user.name);
};

/**
 * Assigns a game role, name, state and vote status to each user
 * in the current game session.
 */
var assignRoles = function (users) {
    var roles = rolemanager.getRoleNames();
    for (var i = 0; i < users.length; i++) {
        users[i].name = names[i];
        users[i].role = roles.splice(getRandomInt(0, roles.length - 1), 1)[0];
        users[i].state = 'alive';
        users[i].vote = 0;
    }
};
/**
 * Initiates a new game by setting up roles and timeouts.
 */
var startGame = function (session) {
    assignRoles(session.users);
    messages.broadcastRoles(session.users);
    setTimeout(function () {
        gameStates(session);
    }, startGameDelay);
    messages.broadcastText(session.users, 'Type .exit to leave the game at any time.');
    messages.broadcastText(session.users, 'Type .role if you forget your role or codename.');
};
/**
 * Node export object.
 */
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
