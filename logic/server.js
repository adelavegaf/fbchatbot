'use strict';

var sensible = require('../security/sensible');
var request = require('request');

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

var sendTextMessage = function (sender, text) {
    var messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: sensible.token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) console.log('Error sending message: ', error);
        else if (response.body.error) console.log('Error: ', response.body.error);
    });
};

var broadcastMessage = function (users, text) {
    users.map(function (sender) {
        sendTextMessage(sender, text);
    });
};

var createSession = function () {
    // WARNING: Shallow copy, if userQueue contains objects, all info in session will be lost.
    broadcastMessage(userQueue, `Game ${sessionId} is now starting...`);
    var session = userQueue.splice();
    sessions[sessionId++] = session;
    userQueue = [];
};

var join = function (sender) {
    sendTextMessage(sender, 'Joining a game session...');
    userQueue.push(sender);
    activeUsers[sender] = sessionId;
    broadcastMessage(userQueue, `A player has joined ${userQueue.length}/7`);
    if (userQueue.length === 7) {
        createSession();
    }
};

var exit = function (sender) {
    delete activeUsers[sender];
    sendTextMessage(sender, 'You have left the game');
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
                sendTextMessage(sender, "You can't do this now!");
                break;
            case '.exit':
                exit(sender);
                break;
            default:
                // send message to other players according to game logic.
                broadcastMessage(sessions[activeUsers[sender]], text);
                break;
        }
    } else {
        switch (text) {
            case '.create':
                sendTextMessage(sender, 'Under development. Try .join instead');
                break;
            case '.join':
                join(sender);
                break;
            case '.exit':
                sendTextMessage(sender, 'You are not on a game!');
                // fall through
            default:
                sendTextMessage(sender, 'Type .join to start a game');
                break;
        }
    }
};

var server = {
    activeUsers: activeUsers,
    userQueue: userQueue,
    sessions: sessions,
    sessionId: sessionId,
    sendTextMessage: sendTextMessage,
    broadcastMessage: broadcastMessage,
    createSession: createSession,
    exit: exit,
    leave: leave,
    hasActiveSession: hasActiveSession,
    parseMessage: parseMessage
};

module.exports = server;
