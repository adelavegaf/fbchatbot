'use strict';

var sensible = require('../security/sensible');
var request = require('request');

var user = {
    id: '',
    state: 'alive or dead',
    role: 'mafia / town',
    name: 'fake name'
};

// Contains all the users that are currently waiting to start a game.
var pending = [];
// Conatins all the active games (group of users) that are currently playing.
var sessions = [];

var sendTextMessage = function (sender, text) {
    var messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: webhookRouter.token
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
    // WARNING: Shallow copy, if pending contains objects, all info in session will be lost.
    sessions.push(pending.split());
    broadcastMessage(pending, "Game is now starting...");
    pending = [];
};

var join = function (sender) {
    pending.push(sender);
    broadcastMessage(pending, `A player has joined ${pending.length}/7`);
    if (pending.length === 7) {
        createSession();
    }
};
// CONSIDER EDGE CASES, i.e. User sending multiple .joins.
var parseMessage = function (sender, text) {
    switch (text) {
        case '.create':
            sendTextMessage(sender, 'Under development.');
            break;
        case '.join':
            sendTextMessage(sender, 'Joining a game session...');
            join(sender);
            break;
        default:
            break;
    }
};

var server = {
    sendTextMessage: sendTextMessage,
    broadcastMessage: broadcastMessage,
    createSession: createSession,
    join: join,
    parseMessage: parseMessage
};

module.exports = server;
