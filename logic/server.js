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
    // WARNING: Shallow copy, if userQueue contains objects, all info in session will be lost.
    messages.broadcastText(userQueue, `Game ${sessionId} is now starting...`);
    console.log('new session: ' + sessions[sessionId]);
    userQueue = [];
    mafia.startGame(sessions[sessionId]);
    sessionId++;
};

/**
 * Joins the waiting queue for a game given that the user is not
 * in a game already.
 */
var joinSession = function (userId) {
    if (hasActiveSession(userId)) {
        messages.sendText(userId, "You are already on a game!");
        return;
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
};

/**
 * Exits a game session, given that the user is in a game.
 */
var exit = function (userId) {
    if (!hasActiveSession(userId)) {
        messages.sendText(userId, "You are not on a game!");
        return;
    }
    var userId = String(userId);
    var sessionId = String(activeUsers[userId]);
    var session = sessions[sessionId];
    session.users.splice(findUser(session, userId), 1);
    delete activeUsers[userId];
    messages.sendText(userId, 'You have left the game');
    messages.broadcastText(session.users, `A player has left the game ${session.users.length}/${minNumPlayers}`);
};

/**
 * Send help information to user with userId.
 */
var help = function (userId) {
    messages.sendHelp(userId);
};

/**
 * Sends role infomration to a user with userId given that he is
 * in a game.
 */
var role = function (userId) {
    if (!hasActiveSession(userId)) {
        messages.sendText(userId, "You are not on a game!");
        return;
    }
    mafia.sendRoleInfo(sessions[activeUsers[userId]], userId);
};

/** 
 * Deletes all information associated to the game session
 * with sessionId.
 */
var cleanSession = function (sessionId) {
    var users = sessions[sessionId].users;
    for (var i = 0; i < users.length; i++) {
        delete activeUsers[users[i].id];
    }
    delete sessions[sessionId];
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
        return;
    }

    if (!verifyActionStamp(userId, properties.sessionId, properties.dayCount)) {
        messages.sendText(userId, 'You are not allowed to cast this action now.');
        return;
    }
    var session = sessions[sessionId];
    mafia.gameAction(session, properties);
};
/**
 * Handles initial parsing of a payload. Redirects
 * further handling to appropiate function.
 */
var parsePayload = function (userId, payload) {
    var optionArray = payload.split(";");
    switch (optionArray[0]) {
        case 'join':
            joinSession(userId);
            break;
        case 'exit':
            exit(userId);
            break;
        case 'help':
            help(userId);
            break;
        default:
            callGameAction(userId, optionArray);
            break;
    }
};
/**
 * Node export object.
 */
var server = {
    activeUsers: activeUsers,
    userQueue: userQueue,
    sessions: sessions,
    sessionId: sessionId,
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
