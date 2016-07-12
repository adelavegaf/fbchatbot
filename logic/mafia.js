'use strict';

var rolemanager = require('./rolemanager');
var messagemanager = require('./messagemanager');
/**
 * Predefined user alias.
 */
var names = ['Peyton', 'Sam', 'Alex', 'Morgan', 'Taylor', 'Carter', 'Jessie'];

/**
 * Delay to start a game. This is done in order to give
 * users important information that helps them interact with the game.
 */
var startGameDelay = 10000;
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
    return rolemanager.getSameAllianceUsers('mafia', users);
};

var getUsersInTown = function (users) {
    return rolemanager.getSameAllianceUsers('town', users);
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
    var quorum = parseInt(numUsers / 2) + 1;
    return quorum;
};
/**
 * Tells users if a player was lynched in the voting phase.
 * Returns true if a user was lynched, otherwise false.
 */
var afterVotePhase = function (session) {
    if (typeof session.votedUser.name !== 'undefined') {
        messagemanager.voteAccepted(session.users, session.votedUser);
        if (session.votedUser.role === 'Mafia Boss') {
            var mafiosos = getUsersInMafia(session.users);
            rolemanager.findNewMafiaBoss(mafiosos, messagemanager);
        }
        return true;
    }
    messagemanager.voteDenied(session.users);
    return false;
};
/**
 * Handles voting mechanism.
 **/
var vote = function (session, userId, toWhom) {

    var currentUser = getUserFromId(session, userId);
    var targetUser = getUserFromId(session, toWhom);

    if (session.state !== 'voting') {
        messagemanager.gameStateError(currentUser.id, currentUser.type, 'voting');
        return false;
    }

    if (targetUser === null) {
        messagemanager.userNotFoundError(currentUser.id, currentUser.type);
        return false;
    }

    if (userId === toWhom) {
        messagemanager.selfVoteError(currentUser.id, currentUser.type);
        return false;
    }

    if (hasAlreadyVoted(session, userId)) {
        messagemanager.doubleVoteError(currentUser.id, currentUser.type);
        return false;
    }

    session.voteTally[userId] = true;

    targetUser.vote += 1;

    var quorum = calculateQuorum(session.users);

    if (targetUser.vote >= quorum) {
        session.votedUser = targetUser;
        targetUser.state = 'dead';
    }
    messagemanager.notifyVote(session.users, currentUser, targetUser, quorum);
    return true;
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
            actions[i](messagemanager, session.users);
        }
    }
    var users = session.users;
    for (i = 0; i < users.length; i++) {
        if (users[i].state !== 'dead') {
            users[i].state = 'alive';
        } else if (users[i].state === 'dead' && users[i].role === 'Mafia Boss') {
            var mafiosos = getUsersInMafia(users);
            rolemanager.findNewMafiaBoss(mafiosos, messagemanager);
        }
    }
};
/**
 * Checks if current game is in the night phase.
 */
var checkNightPhase = function (session, id) {
    var user = getUserFromId(session, id);
    if (session.state !== 'night') {
        messagemanager.gameStateError(user.id, user.type, 'night');
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
var speak = function (session, id, text) {
    var user = getUserFromId(session, id);
    var didSpeak = true;
    var combinedState = user.state + " " + session.state;
    switch (combinedState) {
        case 'dead day':
        case 'dead voting':
        case 'dead night':
            var users = getDeadUsers(session.users);
            text = user.name + ' (dead): ' + text;
            messagemanager.broadcastText(id, users, text);
            break;
        case 'alive day':
            text = user.name + ': ' + text;
            messagemanager.broadcastText(id, session.users, text);
            break;
        case 'alive night':
            var role = rolemanager.getRole(user.role);
            if (role.alliance === 'mafia') {
                text = user.name + ' (mafia): ' + text;
                var users = getUsersInMafia(session.users);
                messagemanager.broadcastText(id, users, text);
            }
            break;
        default:
            didSpeak = false;
            break;
    }
    return didSpeak;
};
/**
 * Handles the actions to be taken before the night phase begins.
 * Also, sets timeout to start the day phase.
 */
var nightPhase = function (session) {
    beforeNightPhase(session);
    session.state = 'night';
    var alive = getAliveUsers(session.users);
    var dead = getDeadUsers(session.users);
    messagemanager.notifyNightPhase(alive, dead, session.sessionId, session.dayCount);
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
    var dead = getDeadUsers(session.users);
    messagemanager.notifyVotePhase(alive, dead, session.sessionId, session.dayCount);
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
    messagemanager.notifyDayPhase(session.users, session.dayCount);
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
        messagemanager.notifyDraw(session.users);
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
    messagemanager.notifyWin(session.users, alliance);
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
    messagemanager.role(user);
};

/**
 * Determines if otherUser's role should be revealed to referenceUser.
 */
function shouldRevealRole(referenceUser, otherUser) {
    var referenceAlliance = rolemanager.getRole(referenceUser.role).alliance;
    var otherAlliance = rolemanager.getRole(otherUser.role).alliance;

    if (referenceUser === otherUser) {
        return true;
    } else if (referenceAlliance === 'mafia' && otherAlliance === 'mafia') {
        return true;
    } else if (otherUser.state === 'dead' || otherUser.state === 'disconnected') {
        return true;
    } else {
        return false;
    }
}

/**
 * Sends a particular user with userId the information about all the roles
 * that are in play in the current game session. Reveals which user has which role
 * if conditions are met.
 */
var sendRoles = function (session, userId) {
    var roles = [];
    var referenceUser = getUserFromId(session, userId);
    var completeUsers = session.users.concat(session.disconnected);
    for (var i = 0; i < completeUsers.length; i++) {
        var otherUser = completeUsers[i];
        var role = {};
        role.role = (typeof otherUser.originalRole === 'undefined') ? otherUser.role : otherUser.originalRole;
        role.revealed = shouldRevealRole(referenceUser, otherUser);
        if (role.revealed) {
            role.name = otherUser.name;
        }
        roles.push(role);
    }
    messagemanager.roles(referenceUser, roles);
};

/**
 * Sends a particular user dead users info.
 */
var sendDeadInfo = function (session, userId) {
    var user = getUserFromId(session, userId);
    var deadUsers = getDeadUsers(session.users);
    var completeDeadUsers = deadUsers.concat(session.disconnected);
    messagemanager.dead(user, completeDeadUsers);
};

/**
 * Sends a particular user dead users info.
 */
var sendAliveInfo = function (session, userId) {
    var user = getUserFromId(session, userId);
    var aliveUsers = getAliveUsers(session.users);
    messagemanager.alive(user, aliveUsers);
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
        var roleObj = rolemanager.getRole(users[i].role);
        if (typeof roleObj.init !== 'undefined') {
            roleObj.init(users[i]);
        }
    }
};
/**
 * Initiates a new game by setting up roles and timeouts.
 */
var startGame = function (session) {
    session.roles = assignRoles(session.users);
    messagemanager.notifyRoles(session.users);
    setTimeout(function () {
        gameStates(session);
    }, startGameDelay);
    var durations = {
        startGameDelay: startGameDelay,
        dayDuration: dayDuration,
        votingDuration: votingDuration,
        nightDuration: nightDuration
    };
    messagemanager.notifyStart(session.users, durations);
};

var revealRole = function (user, session) {
    if (user.state === 'alive') {
        messagemanager.revealRole(user, session.users);
    }
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
    getUsersByState: getUsersByState,
    getUsersInMafia: getUsersInMafia,
    getUsersInTown: getUsersInTown,
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
    sendRoles: sendRoles,
    sendDeadInfo: sendDeadInfo,
    sendAliveInfo: sendAliveInfo,
    assignRoles: assignRoles,
    startGame: startGame,
    revealRole: revealRole
};

module.exports = mafia;
