'use strict';

var request = require('request');
var Message = require('./messages');

var user = {
    id: '',
    state: 'alive or dead',
    role: 'mafia / town',
    name: 'fake name'
};

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
    Message.broadcastText(userQueue, `Game ${sessionId} is now starting...`);
    var session = userQueue.splice();
    sessions[sessionId++] = session;
    userQueue = [];
};

var join = function (sender) {
    Message.sendText(sender, 'Joining a game session...');
    userQueue.push(sender);
    activeUsers[sender] = sessionId;
    Message.broadcastText(userQueue, `A player has joined ${userQueue.length}/7`);
    if (userQueue.length === 7) {
        createSession();
    }
};

var exit = function (sender) {
    delete activeUsers.sender;
    Message.sendText(sender, 'You have left the game');
};

var hasActiveSession = function (sender) {
    return !(typeof activeUsers[sender] === undefined);
};

// CONSIDER EDGE CASES, i.e. User sending multiple .joins.
// Consider using a generic template. Refactor using error displaying function.
var parseMessage = function (sender, text) {
    if (hasActiveSession(sender)) {
        switch (text) {
            case '.create':
            case '.join':
                Message.sendText(sender, "You can't do this now!");
                break;
            case '.exit':
                exit(sender);
                break;
            default:
                // send message to other players according to game logic.
                Message.broadcastText(sessions[activeUsers[sender]], text);
                break;
        }
    } else {
        Message.sendStartGame(sender);
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
    hasActiveSession: hasActiveSession,
    parseMessage: parseMessage
};

module.exports = server;
