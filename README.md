# Mafia Chat Game

Online multiplayer [Mafia](https://en.wikipedia.org/wiki/Mafia_(party_game)) game implementation. Can be played through the [web app](https://mafiachatgame.herokuapp.com) or through [Facebook Messenger](https://facebook.com/mafiachatgame).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.  

git clone https://github.com/adelavegaf/mafiachatgame.git  
npm start  

### Prerequisites

You need to have installed [npm](https://www.npmjs.com/) in your system.  
In order for the Facebook Chat Bot to work, you must have an active facebook page.  

### Installing

npm install  

## Running the tests

At the root of the project type:

npm test

### Break down into end to end tests

Tests the server implementation and the game logic. Note that the tests do not cover server communication with Facebook Messenger API and thus errors might be generated when communicating to them.

## Deployment


In order for the app to work with Facebook Messenger, you must change the information in the file ./security/sensible.js.

```javascript
token: "<token_here>",
verify_token: "<verify_token_here>"
```

Additionally, you must modify the value of the attribute messenger_app_id in the file ./views/play.html.

```html
<div class="fb-messengermessageus" messenger_app_id="496004080598108" page_id="1691882611078540" color="white" size="xlarge">
```

## Built With

* NodeJS - Used for server and game logic implementation.
* Express - RESTful API.
* AngularJS - Used for web app Front End with Angular Material.
* SocketIO - Used for web app - server communication.

## Authors

* **Antonio de la Vega**

## License

This project is licensed under the MIT License.