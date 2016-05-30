'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var sensible = require('../security/sensible');
var server = require('../logic/server');

var webhookRouter = express.Router();

webhookRouter.use(bodyParser.json());

webhookRouter.route('/')
    .get(function (req, res, next) {
        if (req.query['hub.verify_token'] === sensible.verify_token) {
            res.send(req.query['hub.challenge']);
        } else {
            res.send('Error, wrong  validation token');
        }
    })
    .post(function (req, res, next) {
        var messaging_events = req.body.entry[0].messaging;
        for (var i = 0; i < messaging_events.length; i++) {
            var event = req.body.entry[0].messaging[i];
            var sender = event.sender.id;
            if (event.message && event.message.text) {
                var text = event.message.text;
                server.parseMessage(sender, text);
                //webhookRouter.sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
            }
        }
        res.sendStatus(200);
    });

module.exports = webhookRouter;
