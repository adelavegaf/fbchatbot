'use strict';

angular.module('mafiaApp').controller('GameplayController', ['$scope', '$state', function ($scope, $state) {
    $scope.title = 'Gameplay';

    $scope.tabItems = ['General rules', 'Phases', 'Web App', 'Facebook App'];

    $scope.selectedItem = '';

    $scope.selectItem = function (item) {
        switch (item) {
            case 'General rules':
                $state.go('mafia.gameplay.rules');
                break;
            case 'Phases':
                $state.go('mafia.gameplay.phases');
                break;
            case 'Web App':
                $state.go('mafia.gameplay.webapp');
                break;
            case 'Facebook App':
                $state.go('mafia.gameplay.fbapp');
                break;
        }
    };
}]);
