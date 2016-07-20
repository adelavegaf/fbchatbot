'use strict';

angular.module('mafiaApp', ['ui.router', 'ngResource', 'ngAnimate', 'ngMaterial'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mafia', {
                url: '/',
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'HeaderController'
                    },
                    'content': {
                        templateUrl: 'views/home.html'
                    },
                    'footer': {
                        templateUrl: 'views/footer.html',
                        controller: 'FooterController'
                    }
                }

            })
            .state('mafia.play', {
                url: 'play',
                views: {
                    'content@': {
                        templateUrl: 'views/play.html',
                        controller: 'GameController'
                    }
                }
            })
            .state('mafia.gameplay', {
                url: 'gameplay',
                views: {
                    'content@': {
                        templateUrl: 'views/gameplay.html',
                    }
                }
            })
            .state('mafia.roles', {
                url: 'roles',
                views: {
                    'content@': {
                        templateUrl: 'views/roles.html',
                    }
                }
            })
            .state('mafia.development', {
                url: 'development',
                views: {
                    'content@': {
                        templateUrl: 'views/development.html',
                    }
                }
            });
        $urlRouterProvider.otherwise('/play');
    });
