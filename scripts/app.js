'use strict';

angular.module('mafiaApp', ['ui.router', 'ngResource'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mafia', {
                url: '/',
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                    },
                    'content': {
                        templateUrl: 'views/home.html',
                    },
                    'footer': {
                        templateUrl: 'views/footer.html',
                    }
                }

            });
        $urlRouterProvider.otherwise('/');
    });
