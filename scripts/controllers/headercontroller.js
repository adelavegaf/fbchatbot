'use strict';

angular.module('mafiaApp').controller('HeaderController', ['$scope', '$state', function ($scope, $state) {

    $scope.active = $state.current.name;

    $scope.setActive = function (link) {
        $scope.active = link;
    };

    $scope.isActive = function (link) {
        return $scope.active === link;
    };
}]);
