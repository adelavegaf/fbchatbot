'use strict';

var messages = require('./messages');
var mafia = require('./mafia');

// Minimum number of players to start a game. Recommended to be minimum 7.
var minNumPlayers = 2;
// Contains all of the active users.
var activeUsers = {};
// Contains all the users that are currently waiting to start a game.
var userQueue = [];
// Contains all the active games (group of users) that are currently playing.
var sessions = {};
//
var sessionId = 0;

var findUser = function (session, userId) {
    var users = session.users;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            return i;
        }
    }
    return -1;
};

var beginSession = function () {
    // WARNING: Shallow copy, if userQueue contains objects, all info in session will be lost.
    messages.broadcastText(userQueue, `Game ${sessionId} is now starting...`);
    console.log('new session: ' + sessions[sessionId]);
    userQueue = [];
    mafia.startGame(sessions[sessionId]);
    sessionId++;
};

// WARNING: Concurrency issues with beginSession and join. Beware.
// REFACTOR: Change 11 (magic number) to an appropiate variable from Mafia.js
var joinSession = function (userId) {
    if (hasActiveSession(userId)) {
        messages.sendText(userId, "You are already on a game!");
        return;
    }
    if (userQueue.length === 0) {
        sessions[sessionId] = {
            sessionId: sessionId,
            state: 'connecting',
            dayCount: 11,
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

var help = function (userId) {
    messages.sendHelp(userId);
};

var hasActiveSession = function (userId) {
    var property = String(userId);
    return typeof activeUsers[property] !== 'undefined';
};

// CONSIDER EDGE CASES, i.e. User sending multiple .joins.
// Consider using a generic template. Refactor using error displaying function.
var parseMessage = function (userId, text) {
    switch (text) {
        case '.exit':
            messages.sendExitGame(userId);
            break;
        case '.help':
            help(userId);
            break;
        default:
            if (!hasActiveSession(userId)) messages.sendStartGame(userId);
            else console.log('else');
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

var callGameAction = function (userId, optionArray) {
    var properties = {
        action: optionArray[0],
        from: userId,
        to: optionArray[1],
        sessionId: parseInt(optionArray[2], 10),
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

    mafia.gameAction(session, properties);
};

var parsePayload = function (userId, payload) {
    var optionArray = payload.split(";");
    console.log(optionArray);
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
            console.log("Reached gameAction");
            callGameAction(userId, optionArray);
            console.log("Completed gameAction");
            break;
    }
};

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
    hasActiveSession: hasActiveSession,
    parseMessage: parseMessage,
    verifyActionStamp: verifyActionStamp,
    callGameAction: callGameAction,
    parsePayload: parsePayload
};

module.exports = server;
