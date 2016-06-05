'use strict';

var messages = require('./messages');
var mafia = require('./mafia');

/**
 * Minimum number of players to start a game. Recommended to be minimum 7.
 */
var minNumPlayers = 2;
/**
 * Contains all of the active users.
 */
var activeUsers = {};
/**
 * Contains all the users that are currently waiting to start a game.
 */
var userQueue = [];
/**
 * Contains all the active games (group of users) that are currently playing.
 */
var sessions = {};
/**
 * Unique number associated with each session.
 */
var sessionId = 0;

/**
 * Reinitializes all the arrays and objects.
 * Used for running unit tests.
 */
var resetServer = function () {
    activeUsers = {};
    userQueue = [];
    sessions = {};
    sessionId = 0;
};

/**
 * Returns the userQueue array.
 */
var getUserQueue = function () {
    return userQueue;
};
/**
 * Returns the active users object
 */
var getActiveUsers = function () {
    return activeUsers;
};
/**
 * Returns the sessions object.
 */
var getSessions = function () {
    return sessions;
};

/**
 * Returns the last sessionId
 */
var getSessionId = function () {
    return sessionId;
};
/**
 * Finds the index at which the user with userId is located
 * in the session.users array.
 */
var findUser = function (session, userId) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            return i;
        }
    }
    return -1;
};

/**
 * Starts a new game with all users in userqueue.
 */
var beginSession = function () {
    userQueue = [];
    messages.broadcastText(userQueue, `Game ${sessionId} is now starting...`);
    mafia.startGame(sessions[sessionId]);
    sessionId++;
};

/**
 * Joins the waiting queue for a game given that the user is not
 * in a game already.
 * Returns true if the user could join the session. Otherwise, false.
 */
var joinSession = function (userId) {
    if (hasActiveSession(userId)) {
        messages.sendText(userId, "You are already on a game!");
        return false;
    }
    if (userQueue.length === 0) {
        sessions[sessionId] = {
            sessionId: sessionId,
            state: 'connecting',
            dayCount: mafia.gameDuration,
            users: userQueue
        };
    }
    userQueue.push({
        id: userId
    });
    activeUsers[userId] = sessionId;
    messages.broadcastText(userQueue, `A player has joined ${userQueue.length}/${minNumPlayers}`);
    if (userQueue.length === minNumPlayers) {
        beginSession();
    }
    return true;
};

/**
 * Exits a game session, given that the user is in a game.
 * Returns true if the user could exit the game. Otherwise false.
 */
var exit = function (userId) {
    if (!hasActiveSession(userId)) {
        messages.sendText(userId, "You are not on a game!");
        return false;
    }
    var userId = String(userId);
    var sessionId = String(activeUsers[userId]);
    var session = sessions[sessionId];
    session.users.splice(findUser(session, userId), 1);
    delete activeUsers[userId];
    messages.sendText(userId, 'You have left the game');
    messages.broadcastText(session.users, `A player has left the game ${session.users.length}/${minNumPlayers}`);
    return true;
};

/**
 * Send help information to user with userId.
 */
var help = function (userId) {
    messages.sendHelp(userId);
};

/**
 * Sends role information to a user with userId given that he is
 * in a game. Returns true if the user has a role. Otherwise, false.
 */
var role = function (userId) {
    if (!hasActiveSession(userId)) {
        messages.sendText(userId, "You are not on a game!");
        return false;
    }
    mafia.sendRoleInfo(sessions[activeUsers[userId]], userId);
    return true;
};

/** 
 * Deletes all information associated to the game session
 * with sessionId. Returns true if the session could be deleted.
 * Otherwise, returns false.
 */
var cleanSession = function (sessionId) {
    if (typeof sessions[sessionId] === 'undefined') {
        return false;
    }
    var users = sessions[sessionId].users;
    for (var i = 0; i < users.length; i++) {
        delete activeUsers[users[i].id];
    }
    delete sessions[sessionId];
    return true;
};

/**
 * Determines if the user with userId has an
 * active game session.
 */
var hasActiveSession = function (userId) {
    var property = String(userId);
    var sessionId = activeUsers[property];

    if (typeof sessionId === 'undefined') {
        return false;
    }
    if (sessions[sessionId].state !== 'finished') {
        return true;
    }

    cleanSession(sessionId);
    return false;
};

/**
 * Given a user text message, determines the appropiate
 * behaviour that must be triggered by the server.
 */
var parseMessage = function (userId, text) {
    switch (text) {
        case '.exit':
            messages.sendExitGame(userId);
            break;
        case '.help':
            help(userId);
            break;
        case '.role':
            role(userId);
            break;
        default:
            if (!hasActiveSession(userId)) {
                messages.sendStartGame(userId);
            } else {
                var session = sessions[activeUsers[userId]];
                mafia.speak(session, userId, text);
            }
            break;
    }
};

/**
 * Since postback buttons stay in the conversation indefinitely,
 * we must verify the button was pressed in the current session,
 * and in the corresponding turn.
 */
var verifyActionStamp = function (userId, sessionId, dayCount) {
    var curSessionId = activeUsers[userId];
    var curSession = sessions[curSessionId];
    return sessionId === curSessionId && curSession.dayCount === dayCount;
};

/**
 * Organizes payload information that is sent by a user.
 * Calls appropiate method in mafia to handle user action.
 */
var callGameAction = function (userId, optionArray) {
    var sessionId = activeUsers[userId];

    var properties = {
        action: optionArray[0],
        from: userId,
        to: optionArray[1],
        sessionId: sessionId,
        dayCount: parseInt(optionArray[3], 10)
    };

    if (!hasActiveSession(userId)) {
        messages.sendText(userId, 'You are not in a game.');
        return false;
    }

    if (!verifyActionStamp(userId, properties.sessionId, properties.dayCount)) {
        messages.sendText(userId, 'You are not allowed to cast this action now.');
        return false;
    }
    var session = sessions[sessionId];
    mafia.gameAction(session, properties);
    return true;
};
/**
 * Handles initial parsing of a payload. Redirects
 * further handling to appropiate function.
 */
var parsePayload = function (userId, payload) {
    var optionArray = payload.split(";");
    switch (optionArray[0]) {
        case 'join':
            return joinSession(userId);
            break;
        case 'exit':
            return exit(userId);
            break;
        case 'help':
            return help(userId);
            break;
        default:
            return callGameAction(userId, optionArray);
            break;
    }
};
/**
 * Node export object.
 */
var server = {
    minNumPlayers: minNumPlayers,
    activeUsers: activeUsers,
    userQueue: userQueue,
    sessions: sessions,
    sessionId: sessionId,
    resetServer: resetServer,
    getUserQueue: getUserQueue,
    getActiveUsers: getActiveUsers,
    getSessions: getSessions,
    getSessionId: getSessionId,
    findUser: findUser,
    beginSession: beginSession,
    joinSession: joinSession,
    exit: exit,
    help: help,
    role: role,
    cleanSession: cleanSession,
    hasActiveSession: hasActiveSession,
    parseMessage: parseMessage,
    verifyActionStamp: verifyActionStamp,
    callGameAction: callGameAction,
    parsePayload: parsePayload
};

module.exports = server;
