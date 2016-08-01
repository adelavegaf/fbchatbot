'use strict';

angular.module('mafiaApp').controller('RolesController', ['$scope', function ($scope) {
    $scope.title = 'Roles';

    $scope.tabItems = ['Doctor', 'Vigilante', 'Mafia Boss', 'Mafioso', 'Fixer', 'Barman', 'Detective'];

    $scope.selectedItem = '';

    $scope.information = {};

    $scope.selectItem = function (item) {
        $scope.selectedItem = item;
    };

    $scope.information['Doctor'] = [

    ];

    $scope.information['Vigilante'] = [

    ];

    $scope.information['Mafia Boss'] = [

    ];

    $scope.information['Mafioso'] = [

    ];

    $scope.information['Fixer'] = [

    ];

    $scope.information['Barman'] = [

    ];

    $scope.information['Detective'] = [

    ];
}]);
