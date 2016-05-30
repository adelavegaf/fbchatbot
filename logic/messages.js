'use strict';

var request = require('request');
var sensible = require('../security/sensible');

var sendText = function (sender, text) {
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
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

var broadcastText = function (users, text) {
    users.map(function (sender) {
        sendText(sender, text);
    });
};

var messages = {
    sendText: sendText,
    //sendStartGame: sendStartGame,
    broadcastText: broadcastText
};

module.exports = messages;
