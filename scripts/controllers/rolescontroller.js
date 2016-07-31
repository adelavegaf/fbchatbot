'use strict';

angular.module('mafiaApp').controller('RolesController', ['$scope', function ($scope) {
    $scope.title = 'Roles';

    $scope.tabItems = ['Doctor', 'Vigilante', 'Mafia Boss', 'Mafioso', 'Fixer', 'Barman', 'Investigator'];
}]);
