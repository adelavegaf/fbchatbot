'use strict';

var request = require('request');
var sensible = require('../security/sensible');

/**
 * Sends a message, with specifications in messageData, to a user with userId.
 */
var sendMessage = function (userId, messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: sensible.token
        },
        method: 'POST',
        json: {
            recipient: {
                id: userId
            },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
/**
 * Sends a text msg to user with userId.
 */
var sendText = function (userId, text) {
    var messageData = {
        text: text
    };
    sendMessage(userId, messageData);
};
/**
 * Prompts the user with userId to join a game.
 */
var sendStartGame = function (userId) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Mafia Chat Game",
                "buttons": [{
                    "type": "postback",
                    "title": "Join Game",
                    "payload": "join"
                }, {
                    "type": "postback",
                    "title": "Help",
                    "payload": "help"
                }]
            }
        }
    };
    sendMessage(userId, messageData);
};
/**
 * Prompts the user with userId to confirm if he wants to exit game.
 */
var sendExitGame = function (userId) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Are you sure you want to exit?",
                "buttons": [{
                    "type": "postback",
                    "title": "Yes",
                    "payload": "exit"
                }, {
                    "type": "postback",
                    "title": "No",
                    "payload": "ignore"
                }]
            }
        }
    };
    sendMessage(userId, messageData);
};
/**
 * Send day notification structured message to a particular user with userId.
 */
var sendDayTime = function (userId) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "elements": [{
                    "template_type": "generic",
                    "title": "Day Time",
                    "subtitle": "1.5min to talk"
                }]
            }
        }
    };
    sendMessage(userId, messageData);
};
/**
 * Send vote structured message to a particular user with userId.
 * elements: information to be able to vote on each alive user.
 */
var sendVotingTime = function (userId, elements) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "elements": elements
            }
        }
    };
    sendMessage(userId, messageData);
};
/**
 * Send a text message with available commands
 * to the user with userId.
 */
var sendHelp = function (userId) {
    var text = 'Commands:\n .help : shows you the list of available commands.\n .exit : prompts you to leave current game.';
    sendText(userId, text);
};
/**
 * Sends the text to all of the elements in user. 
 */
var broadcastText = function (users, text) {
    for (var i = 0; i < users.length; i++) {
        sendText(users[i].id, text);
    }
};
/**
 * Sends msg (text) to each element in users
 * except for user with userId: the one who emmits the msg.
 */
var broadcastLimited = function (userId, users, text) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) continue;
        sendText(users[i].id, text);
    }
};
/**
 * Send voting structured message to alive users.
 */
var broadcastVoting = function (users, game) {

};

var messages = {
    sendMessage: sendMessage,
    sendText: sendText,
    sendStartGame: sendStartGame,
    sendExitGame: sendExitGame,
    sendDayTime: sendDayTime,
    sendVotingTime: sendVotingTime,
    sendHelp: sendHelp,
    broadcastText: broadcastText,
    broadcastLimited: broadcastLimited,
    broadcastVoting: broadcastVoting
};

module.exports = messages;
