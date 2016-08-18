# Mafia Chat Game

Online multiplayer [Mafia](https://en.wikipedia.org/wiki/Mafia_(party_game)) game implementation. Can be played through the [web app](https://mafiachatgame.herokuapp.com) or through [Facebook Messenger](https://facebook.com/mafiachatgame).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.  

git clone https://github.com/adelavegaf/mafiachatgame.git  
npm start  

### Prerequisites

You need to have installed [npm](https://www.npmjs.com/) in your system.  
In order for the Facebook Chat Bot to work you must have an active facebook page.  

### Installing

npm install  

## Running the tests

At the root of the project type:

npm test

### Break down into end to end tests

Tests the server implementation and the game logic. Note that the tests do not cover server communication with Facebook Messenger API and thus errors might be generated when communicating to them.

## Deployment

In order for the app to work with Facebook Messenger you must change the information in the file ./security/sensible.js. Also, you must change the value of the APP_ID attribute in the div element in the file ./views/play.html.

## Built With

* NodeJS - Used for server and game logic implementation.
* Express - RESTful API.
* AngularJS - Used for web app Front End with Angular Material.

## Authors

* **Antonio de la Vega**

## License

This project is licensed under the MIT License.