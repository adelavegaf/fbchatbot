'use strict';

angular.module('mafiaApp').controller('GameplayController', ['$scope', function ($scope) {
    $scope.title = 'Gameplay';

    $scope.menuItems = [
        {
            name: 'General rules'
        },
        {
            name: 'Phases'
        },
        {
            name: 'Status bar'
        }
    ];
}]);
