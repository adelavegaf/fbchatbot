'use strict';

var request = require('request');
var sensible = require('../security/sensible');

var sendMessage = function (sender, messageData) {
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
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

var sendText = function (sender, text) {
    var messageData = {
        text: text
    };
    sendMessage(sender, messageData);
};

var sendStartGame = function (sender) {
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
    sendMessage(sender, messageData);
};

var sendExitGame = function (sender) {
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
    sendMessage(sender, messageData);
}

var sendHelp = function (sender) {
    var text = 'Commands:\n .help : shows you the list of available commands.\n .exit : prompts you to leave current game.';
    sendText(sender, text);
};

var broadcastText = function (users, text) {
    users.map(function (sender) {
        sendText(sender, text);
    });
};

var messages = {
    sendMessage: sendMessage,
    sendText: sendText,
    sendStartGame: sendStartGame,
    sendExitGame: sendExitGame,
    sendHelp: sendHelp,
    broadcastText: broadcastText
};

module.exports = messages;
