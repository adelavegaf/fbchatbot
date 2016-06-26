'use strict';

var mafia = require('./mafia');
var messagemanager = require('./messagemanager');

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
 * Count of all the users that are in a game with id 'sessionId'.
 */
var getNumPlayersGame = function (sessionId) {
    if (typeof sessions[sessionId] === 'undefined') {
        return 0;
    }
    return sessions[sessionId].users.length;
};

/**
 * Count of all the users that are in games.
 */
var getTotalNumPlayers = function () {
    var numOnlineUsers = 0;
    for (var property in sessions) {
        if (sessions.hasOwnProperty(property)) {
            numOnlineUsers += getNumPlayersGame(property);
        }
    }
    return numOnlineUsers;
};

/**
 * Creates a new game.
 */
var createSession = function () {
    if (typeof sessions[sessionId] !== 'undefined') {
        return false;
    }
    sessions[sessionId] = {
        sessionId: sessionId,
        state: 'connecting',
        dayCount: mafia.gameDuration,
        users: userQueue,
        disconnected: []
    };
    return true;
};

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
var findUserIndex = function (session, id) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            return i;
        }
    }
    return -1;
};

/**
 * Finds the user with unique identifier id in the server.
 */
var findUser = function (id) {
    var sessionId = activeUsers[id];
    var session = sessions[sessionId];
    var user = session.users[findUserIndex(session, id)];
    return user;
};

/**
 * Starts a new game with all users in userqueue.
 */
var beginSession = function () {
    userQueue = [];
    mafia.startGame(sessions[sessionId]);
    sessionId++;
};

/**
 * Joins the waiting queue for a game given that the user is not
 * in a game already.
 * Returns true if the user could join the session. Otherwise, false.
 * Method triggered when joining through Facebook Messenger.
 */
var facebookJoin = function (userId) {
    return joinSession(userId, 'facebook');
};

/**
 * Joins a user that is using the web app to a
 * game session.
 */
var webJoin = function (socket) {
    socket.join(sessionId.toString());
    return joinSession(socket.id, 'web', socket);
};

/**
 * General behaviour when joining a game from any source.
 */
var joinSession = function (id, type) {
    if (hasActiveSession(id)) {
        messagemanager.joinError(id, type);
        return false;
    }

    activeUsers[id] = sessionId;

    if (userQueue.length === 0) {
        server.createSession();
    }

    var user = {
        id: id,
        type: type
    };

    if (type === 'web' && arguments.length !== Function.length) {
        user.socket = arguments[Function.length];
    }

    userQueue.push(user);

    messagemanager.notifyJoin(userQueue);

    if (userQueue.length === minNumPlayers) {
        beginSession();
    }

    return true;
};

/**
 * Exits a game session, given that the user is in a game.
 * Returns true if the user could exit the game. Otherwise false.
 */
var exit = function (id, type) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, type);
        return false;
    }
    var id = String(id);
    var sessionId = String(activeUsers[id]);
    var session = sessions[sessionId];
    var user = session.users.splice(findUserIndex(session, id), 1);
    delete activeUsers[id];
    messagemanager.notifyExit(session.users);
    session.disconnected.push(user);
    mafia.revealRole(user, session);
    return true;
};

/**
 * Send help information to user with id.
 */
var help = function (id) {
    messagemanager.help(id, 'facebook');
};

/**
 * Sends role information to a user with id given that he is
 * in a game. Returns true if the user has a role. Otherwise, false.
 */
var role = function (id) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, 'facebook');
        return false;
    }
    mafia.sendRoleInfo(sessions[activeUsers[id]], id);
    return true;
};

/**
 * Sends a msg to user with id about
 * the people that are currently alive.
 */
var alive = function (id, type) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, type);
        return false;
    }
    mafia.sendAliveInfo(sessions[activeUsers[id]], id);
    return true;
};

/**
 * Sends a msg to user with id about
 * all of the dead people and their roles.
 */
var dead = function (id, type) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, type);
        return false;
    }
    mafia.sendDeadInfo(sessions[activeUsers[id]], id);
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
 * Determines if the user with id has an
 * active game session.
 */
var hasActiveSession = function (id) {
    var property = String(id);
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
 * Facebook Messenger point of entry.
 */
var parseFbMessage = function (userId, text) {
    switch (text) {
        case '.exit':
            messagemanager.exitGame(userId, 'facebook');
            break;
        case '.help':
            help(userId);
            break;
        case '.role':
            role(userId);
            break;
        case '.alive':
            alive(userId, 'facebook');
            break;
        case '.dead':
            dead(userId, 'facebook');
            break;
        default:
            if (!hasActiveSession(userId)) {
                messagemanager.startGame(userId, 'facebook');
            } else {
                var session = sessions[activeUsers[userId]];
                mafia.speak(session, userId, text);
            }
            break;
    }
};

/**
 * Given a user text message, determines the appropiate
 * behaviour that must be triggered by the server.
 * Web app point of entry.
 */
var parseWebMessage = function (id, text) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, 'web');
        return false;
    } else {
        var session = sessions[activeUsers[id]];
        return mafia.speak(session, id, text);
    }
};

/**
 * Since postback buttons stay in the conversation indefinitely,
 * we must verify the button was pressed in the current session,
 * and in the corresponding turn.
 */
var verifyActionStamp = function (id, sessionId, dayCount) {
    var curSessionId = activeUsers[id];
    var curSession = sessions[curSessionId];
    return sessionId === curSessionId && curSession.dayCount === dayCount;
};

/**
 * Organizes payload information that is sent by a user.
 * Calls appropiate method in mafia to handle user action.
 */
var callGameAction = function (id, properties, type) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, type);
        return false;
    }

    if (!verifyActionStamp(id, properties.sessionId, properties.dayCount)) {
        messagemanager.actionError(id, type);
        return false;
    }
    var session = sessions[properties.sessionId];
    mafia.gameAction(session, properties);
    return true;
};
// private
var createProperties = function (arr) {
    var sessionId = activeUsers[id];
    var properties = {
        action: optionArray[0],
        from: id,
        to: optionArray[1],
        sessionId: sessionId,
        dayCount: parseInt(optionArray[3], 10)
    };
    return properties;
};
/**
 * Handles initial parsing of a payload. Redirects
 * further handling to appropiate function.
 * One of facebook's messenger points of entry.
 */
var parsePayload = function (id, payload) {
    var optionArray = payload.split(";");
    var properties;
    switch (optionArray[0]) {
        case 'join':
            return facebookJoin(id);
            break;
        case 'exit':
            return exit(id, 'facebook');
            break;
        case 'help':
            return help(id);
            break;
        default:
            properties = createProperties(optionArray);
            return callGameAction(userId, properties, 'facebook');
            break;
    }
};

/**
 * Node export object.
 */
var server = {
    getNumPlayersGame: getNumPlayersGame,
    getTotalNumPlayers: getTotalNumPlayers,
    webJoin: webJoin,
    facebookJoin: facebookJoin,
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
    findUserIndex: findUserIndex,
    beginSession: beginSession,
    createSession: createSession,
    joinSession: joinSession,
    exit: exit,
    help: help,
    role: role,
    alive: alive,
    dead: dead,
    cleanSession: cleanSession,
    hasActiveSession: hasActiveSession,
    parseFbMessage: parseFbMessage,
    parseWebMessage: parseWebMessage,
    verifyActionStamp: verifyActionStamp,
    callGameAction: callGameAction,
    createProperties: createProperties,
    parsePayload: parsePayload
};

module.exports = server;
