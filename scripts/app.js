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
                        templateUrl: 'views/content.html',
                        controller: 'GameplayController'
                    }
                }
            })
            .state('mafia.roles', {
                url: 'roles',
                views: {
                    'content@': {
                        templateUrl: 'views/content.html',
                        controller: 'RolesController'
                    }
                }
            })
            .state('mafia.development', {
                url: 'development',
                views: {
                    'content@': {
                        templateUrl: 'views/content.html',
                        controller: 'DevelopmentController'
                    }
                }
            });
        $urlRouterProvider.otherwise('/play');
    });
