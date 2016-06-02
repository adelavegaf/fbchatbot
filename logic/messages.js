'use strict';

var request = require('request');
var sensible = require('../security/sensible');
var rolemanager = require('./rolemanager');

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

var sendRoleInfo = function (userId, role, name) {
    var roleData = rolemanager.getRole(role);
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": role + " codename: " + name,
                    "subtitle": roleData.description
                }]
            }
        }
    };
    sendMessage(userId, messageData);
};
/**
 * Send day notification structured message to a particular user with userId.
 */
var sendDayTime = function (userId, dayCount) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Day Time",
                    "subtitle": "90s to talk. " + dayCount + " days remaning.",
                    "image_url": "https://mafiabotgame.herokuapp.com/images/day-min.png"
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
                "image_url": options.image_url,
                "buttons": buttons
            });
        }
        buttons.push({
            "type": "postback",
            "title": users[i].name,
            "payload": options.identifier + ";" + users[i].id + ";" + sessionId + ";" + dayCount
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

var broadcastDay = function (users, dayCount) {
    for (var i = 0; i < users.length; i++) {
        sendDayTime(users[i].id, dayCount);
    }
};

var broadcastRoles = function (users) {
    for (var i = 0; i < users.length; i++) {
        sendRoleInfo(users[i].id, users[i].role, users[i].name);
    }
};

var broadcastNightAction = function (sessionId, dayCount, users) {
    var title = 'Night time';
    for (var i = 0; i < users.length; i++) {
        var subtitle, identifier;
        var role = rolemanager.getRole(users[i].role);
        var options = {
            title: title,
            subtitle: role.nightinfo,
            identifier: users[i].role,
            "image_url": "https://mafiabotgame.herokuapp.com/images/night-min.png"
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
