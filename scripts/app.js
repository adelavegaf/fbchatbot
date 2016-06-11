'use strict';

angular.module('mafiaApp', ['ui.router', 'ngResource'])
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
                        templateUrl: 'views/home.html',
                    },
                    'footer': {
                        templateUrl: 'views/footer.html',
                    }
                }

            })
            .state('mafia.play', {
                url: 'play',
                views: {
                    'content@': {
                        templateUrl: 'views/play.html',
                    }
                }
            })
            .state('mafia.about', {
                url: 'about',
                views: {
                    'content@': {
                        templateUrl: 'views/about.html',
                    }
                }
            });
        $urlRouterProvider.otherwise('/play');
    });
