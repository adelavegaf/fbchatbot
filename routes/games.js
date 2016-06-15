'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var server = require('../logic/server');

var gamesRouter = express.Router();

gamesRouter.use(bodyParser.json());

gamesRouter.route('/')
    .get(function (req, res, next) {

    });

module.exports = gamesRouter;
