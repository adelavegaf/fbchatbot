var express = require('express');
var bodyParser = require('body-parser');

var webhookRouter = express.Router();

webhookRouter.use(bodyParser.json());

webhookRouter.route('/')
 .get(function(req,res,next){
     if(req.query['hub.verify_token'] === 'this_is_it'){
	 res.send(req.query['hub.challenge']);
     }
     else{
	 res.send('Error, wrong  validation token');
     }
});

module.exports = webhookRouter;
