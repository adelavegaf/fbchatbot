var express = require('express');
var bodyParser = require('body-parser');

var webhookRouter = express.Router();

webhookRouter.use(bodyParser.json());

webhookRouter.route('/')
    .get(function (req, res, next) {
        if (req.query['hub.verify_token'] === 'this_is_it') {
            res.send(req.query['hub.challenge']);
        } else {
            res.send('Error, wrong  validation token');
        }
    })
    .post(function (req, res, next) {
        let messaging_events = req.body.entry[0].messaging;
        for (let i = 0; i < messaging_events.length; i++) {
            let event = req.body.entry[0].messaging[i];
            let sender = event.sender.id;
            if (event.message && event.message.text) {
                let text = event.message.text;
                sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
            }
        }
        res.sendStatus(200);
    });

const token = "EAAMAoeY3baQBABpJQ3s631YdZAEVF3nagkVeSIqsD8X1EaKQumdgsZBTCynLcToFkDpbZAzBhFaW7h5ixPucndqAB3Owdix2g1EHsNz3SokKL7HazOSZChEgsVBvXnmGZAMjlKDvnrwS0oQXMpdghRiEw3cAOrkGoom83BDW3ZAAZDZD";

function sendTextMessage(sender, text) {
    let messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
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
}

module.exports = webhookRouter;
