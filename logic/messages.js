var request = require('request');
var sensible = require('../security/sensible');

var Message = {};

Message.sendText = function (sender, text) {
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

Message.sendStartGame = function (sender) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                //image_url:
                "elements": [{
                    "title": "Mafia Chat Bot",
                    "buttons": [{
                        "type": "postback",
                        "title": "Find game"
                    }]
                }]
            }
        }
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
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
};

Message.broadcastText = function (users, text) {
    users.map(function (sender) {
        Message.sendText(sender, text);
    });
};

module.exports = Message;
