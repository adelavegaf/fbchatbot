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
 * socket handler.
 */
var io = {};

/**
 * Sets the io object.
 */
var setIO = function (ioConn) {
    io = ioConn;
};

/**
 * Count of all the users that are in a game with id 'sessionId'.
 */
var getNumPlayersGame = function (sessionId) {
    if (typeof sessions[sessionId] === 'undefined') {
        return 0;
    }
    var room = io.sockets.adapter.rooms[sessionId.toString()];
    var webPlayers = (typeof room === 'undefined') ? 0 : room.length;
    var messengerPlayers = sessions[sessionId].users.length;
    return webPlayers + messengerPlayers;
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
        users: userQueue
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
var findUser = function (session, id) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
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

    return joinSession(socket.id, 'web');
};

/**
 * General behaviour when joining a game from any source.
 */
var joinSession = function (id, type) {
    if (hasActiveSession(userId)) {
        messagemanager.joinError(id, type);
        return false;
    }

    activeUsers[id] = sessionId;

    if (userQueue.length === 0) {
        server.createSession();
    }

    userQueue.push({
        id: id,
        type: type
    });

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
    session.users.splice(findUser(session, id), 1);
    delete activeUsers[id];
    messagemanager.notifyExit(session.users);
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
var alive = function (id) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, 'facebook');
        return false;
    }
    mafia.sendAliveInfo(sessions[activeUsers[id]], id);
    return true;
};

/**
 * Sends a msg to user with id about
 * all of the dead people and their roles.
 */
var dead = function (id) {
    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, 'facebook');
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
 * Facebook Messenger Point of Entry.
 */
var parseMessage = function (userId, text) {
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
            alive(userId);
            break;
        case '.dead':
            dead(userId);
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
 * TO DO: ADD THIRD PARAMETER 'TYPE'.
 */
var callGameAction = function (id, optionArray) {
    var sessionId = activeUsers[id];

    var properties = {
        action: optionArray[0],
        from: id,
        to: optionArray[1],
        sessionId: sessionId,
        dayCount: parseInt(optionArray[3], 10)
    };

    if (!hasActiveSession(id)) {
        messagemanager.noGameError(id, 'facebook');
        return false;
    }

    if (!verifyActionStamp(id, properties.sessionId, properties.dayCount)) {
        messagemanager.actionError(id, 'facebook');
        return false;
    }
    var session = sessions[sessionId];
    mafia.gameAction(session, properties);
    return true;
};
/**
 * Handles initial parsing of a payload. Redirects
 * further handling to appropiate function.
 * One of facebook's messenger points of entry.
 */
var parsePayload = function (userId, payload) {
    var optionArray = payload.split(";");
    switch (optionArray[0]) {
        case 'join':
            return facebookJoin(userId);
            break;
        case 'exit':
            return exit(userId, 'facebook');
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
    setIO: setIO,
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
    findUser: findUser,
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
    parseMessage: parseMessage,
    verifyActionStamp: verifyActionStamp,
    callGameAction: callGameAction,
    parsePayload: parsePayload
};

module.exports = server;
