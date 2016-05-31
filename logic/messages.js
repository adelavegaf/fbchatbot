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

var sendRoleInfo = function (userId, role) {
    var roleInfo;
    switch (role) {
        case 'Doctor':
            roleInfo = 'Prevent someone from dying each night.';
            break;
        case 'Mafioso':
            roleInfo = 'Choose who to kill each night.';
            break;
        case 'Vigilante':
            roleInfo = 'Kill someone each night.';
            break;
        case 'Detective':
            roleInfo = "Learn another person's role each night.";
            break;
        case 'Barman':
            roleInfo = "Block another person's ability each night.";
            break;
        default:
            roleInfo = "No special role. Sorry!";
            break;
    }
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": role,
                    "subtitle": roleInfo
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
                "template_type": "generic",
                "elements": [{
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
var sendUserForm = function (userId, elements) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
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
 * Generates the elements needed to send a structured message
 * that displays the name of all the users that are alive
 * as buttons.
 */
var buildUserForm = function (sessionId, dayCount, users, options) {
    var elements = [];
    var newElement = true;
    var buttons;
    for (var i = 0; i < users.length; i++) {
        if (newElement) {
            buttons = [];
            elements.push({
                "title": options.title,
                "subtitle": options.subtitle,
                "buttons": buttons
            });
        }
        buttons.push({
            "type": "postback",
            "title": users[i].name,
            "payload": options.identifier + ";" + users[i].name + ";" + sessionId + ";" + dayCount
        });
        newElement = buttons.length === 3;
    }
    return elements;
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
 * Send voting structured message to all elements in users.
 * The payload will contain info about sessionId and dayCount.
 */
var broadcastVoting = function (sessionId, dayCount, users) {
    var options = {
        title: "Voting time",
        subtitle: "30s to vote to lynch",
        identifier: "vote"
    }
    var elements = buildUserForm(sessionId, dayCount, users, options);
    for (var i = 0; i < users.length; i++) {
        sendUserForm(users[i].id, elements);
    }
};

var broadcastDay = function (users) {
    for (var i = 0; i < users.length; i++) {
        sendDayTime(users[i].id);
    }
};

var broadcastRoles = function (users) {
    for (var i = 0; i < users.length; i++) {
        sendRoleInfo(users[i].id, users[i].role);
    }
};

var broadcastNightAction = function (sessionId, dayCount, users) {
    var title = 'Night time';
    for (var i = 0; i < users.length; i++) {
        var subtitle, identifier;
        switch (users[i].role) {
            case 'Doctor':
                subtitle = 'Choose who you want to save tonight.';
                identifier = 'heal';
                break;
            case 'Mafioso':
                subtitle = 'Choose who you want to kill tonight.';
                identifier = 'mkill';
                break;
            case 'Vigilante':
                subtitle = 'Choose who you want to kill tonight.';
                identifier = 'vkill';
                break;
            case 'Detective':
                subtitle = "Choose who you want to investigate tonight.";
                identifier = 'investigate';
                break;
            case 'Barman':
                subtitle = "Choose who you want to block tonight.";
                identifier = 'block';
                break;
            default:
                subtitle = "No special action for you.";
                identifier = 'ignore';
                break;
        }
        var options = {
            title: title,
            subtitle: subtitle,
            identifier: identifier
        };
        var elements = buildUserForm(sessionId, dayCount, users, options);
        sendUserForm(users[i].id, elements);
    }
};

var messages = {
    sendMessage: sendMessage,
    sendText: sendText,
    sendStartGame: sendStartGame,
    sendExitGame: sendExitGame,
    sendRoleInfo: sendRoleInfo,
    sendDayTime: sendDayTime,
    sendUserForm: sendUserForm,
    sendHelp: sendHelp,
    buildUserForm: buildUserForm,
    broadcastText: broadcastText,
    broadcastLimited: broadcastLimited,
    broadcastVoting: broadcastVoting,
    broadcastDay: broadcastDay,
    broadcastRoles: broadcastRoles,
    broadcastNightAction: broadcastNightAction
};

module.exports = messages;
