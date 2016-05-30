'use strict';

var messages = require('./messages');

// Contains all of the active users.
var activeUsers = {};
// Contains all the users that are currently waiting to start a game.
var userQueue = [];
// Conatins all the active games (group of users) that are currently playing.
var sessions = {};
//
var sessionId = 0;

var createSession = function () {
    // WARNING: Shallow copy, if userQueue contains objects, all info in session will be lost.
    messages.broadcastText(userQueue, `Game ${sessionId} is now starting...`);
    var session = userQueue.splice(0);
    console.log('new session: ' + session);
    sessions[sessionId++] = session;
};

// WARNING: Concurrency issues with createSession and join. Beware.
var join = function (sender) {
    if (hasActiveSession(sender)) {
        messages.sendText(sender, "You are already on a game!");
        return;
    }
    if (userQueue.length === 0) {
        sessions[sessionId] = userQueue;
    }
    userQueue.push(sender);
    activeUsers[sender] = sessionId;
    messages.broadcastText(userQueue, `A player has joined ${userQueue.length}/7`);
    if (userQueue.length === 7) {
        createSession();
    }
};

var exit = function (sender) {
    if (!hasActiveSession(sender)) {
        messages.sendText(sender, "You are not on a game!");
        return;
    }
    var userId = String(sender);
    var sessionId = String(activeUsers[userId]);
    var session = sessions[sessionId];
    session.splice(session.indexOf(userId), 1);
    delete activeUsers[userId];
    messages.sendText(sender, 'You have left the game');
    messages.broadcastText(session, `A player has left the game ${session.length}/7`);
};

var help = function (sender) {
    messages.sendHelp(sender);
};

var hasActiveSession = function (sender) {
    var property = String(sender);
    return typeof activeUsers[property] !== 'undefined';
};

// CONSIDER EDGE CASES, i.e. User sending multiple .joins.
// Consider using a generic template. Refactor using error displaying function.
var parseMessage = function (sender, text) {
    switch (text) {
        case '.exit':
            messages.sendExitGame(sender);
            break;
        case '.help':
            help(sender);
            break;
        default:
            if (!hasActiveSession(sender)) messages.sendStartGame(sender);
            else messages.broadcastLimited(sender, sessions[activeUsers[sender]], text);
            break;
    }
};

var parsePayload = function (sender, payload) {
    switch (payload) {
        case 'join':
            join(sender);
            break;
        case 'exit':
            exit(sender);
            break;
        case 'help':
            help(sender);
            break;
    }
};

var server = {
    activeUsers: activeUsers,
    userQueue: userQueue,
    sessions: sessions,
    sessionId: sessionId,
    createSession: createSession,
    join: join,
    exit: exit,
    help: help,
    hasActiveSession: hasActiveSession,
    parseMessage: parseMessage,
    parsePayload: parsePayload
};

module.exports = server;
