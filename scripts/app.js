'use strict';

angular.module('mafiaApp', ['ui.router', 'ngResource', 'ngAnimate', 'ngMaterial', 'ezfb'])
    .config(function ($stateProvider, $urlRouterProvider, ezfbProvider) {
        ezfbProvider.setInitParams({
            appId: '496004080598108',
            version: 'v2.6'
        });
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
                        templateUrl: 'views/gameplay.html',
                        controller: 'GameplayController'
                    }
                }
            })
            .state('mafia.gameplay.rules', {
                views: {
                    'information@mafia.gameplay': {
                        templateUrl: 'views/generalrules.html',
                        controller: 'RulesController'
                    }
                }
            })
            .state('mafia.gameplay.phases', {
                views: {
                    'information@mafia.gameplay': {
                        templateUrl: 'views/phases.html'
                    }
                }
            })
            .state('mafia.gameplay.webapp', {
                views: {
                    'information@mafia.gameplay': {
                        templateUrl: 'views/webapp.html',
                        controller: 'WebAppController'
                    }
                }
            })
            .state('mafia.gameplay.fbapp', {
                views: {
                    'information@mafia.gameplay': {
                        templateUrl: 'views/fbapp.html',
                        controller: 'FbAppController'
                    }
                }
            })
            .state('mafia.roles', {
                url: 'roles',
                views: {
                    'content@': {
                        templateUrl: 'views/roles.html',
                        controller: 'RolesController'
                    }
                }
            });
        $urlRouterProvider.otherwise('/play');
    });
