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
    var session = userQueue.splice();
    console.log('new session: ' + JSON.stringify(session));
    sessions[sessionId++] = session;
    userQueue = [];
};

var join = function (sender) {
    messages.sendText(sender, 'Joining a game session...');
    userQueue.push(sender);
    activeUsers[sender] = sessionId;
    messages.broadcastText(userQueue, `A player has joined ${userQueue.length}/7`);
    if (userQueue.length === 7) {
        createSession();
    }
};

var exit = function (sender) {
    var userId = String(sender);
    var sessionId = String(activeUsers[property]);
    var session = sessions[sessionId];
    session.splice(session.indexOf(userId));
    console.log('modified session:' + JSON.stringify(session));
    delete activeUsers[userId];
    messages.sendText(sender, 'You have left the game');
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
    if (hasActiveSession(sender)) {
        switch (text) {
            case '.exit':
                messages.sendExitGame(sender);
                break;
            case '.help':
                help(sender);
                break;
            default:
                // send messages to other players according to game logic.
                // messages.broadcastText(sessions[activeUsers[sender]], text);
                break;
        }
    } else {
        messages.sendStartGame(sender);
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
