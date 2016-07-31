'use strict';

angular.module('mafiaApp').controller('GameplayController', ['$scope', function ($scope) {
    $scope.title = 'Gameplay';

    $scope.tabItems = ['General rules', 'Phases', 'Web App', 'Facebook App'];

    $scope.selectedItem = '';

    $scope.information = {};

    $scope.selectItem = function (item) {
        $scope.selectedItem = item;
    };

    $scope.information['General rules'] = [
        'Mafia is a roleplaying game that models the conflict between two parties, the mafia, and the town. At the start of the game, each player is secretly assigned a role that belongs to one of the two parties. All the players assigned to the mafia know who their teammates are, while the players assigned to the town are clueless as for who belongs to their team. The game consists of three alternating phases: day, voting, and night.',
        'In each of the phases only certain actions can be performed. In the night phase, the mafia privately chooses a town citizen to murder. In the day phase, living players debate the identities of the mafia. Finally, in the voting phase, players cast votes to kill the player they suspect to belong to the mafia.',
        'To make the game balanced, players are not distributed evenly among the two parties. The mafia always has fewer players than the town. Additionally, each role has a special ability that can be performed at night that may help steer the conversation to who belongs to the mafia.',
        'The question then becomes: who do you trust?'];
}]);
