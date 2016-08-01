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
        'Mafia is an online roleplaying game that models the conflict between two parties, the mafia, and the town. At the start of the game, each player is secretly assigned a role that belongs to one of the two parties. All the players assigned to the mafia know who their teammates are, while the players assigned to the town are clueless as for who belongs to their team. The game consists of three alternating phases: day, voting, and night.',
        'In each of the phases only certain actions can be performed. In the night phase, the mafia privately chooses a town citizen to murder. In the day phase, living players debate the identities of the mafia. Finally, in the voting phase, players cast votes to kill the player they suspect to belong to the mafia. You may want to refer to the phases section for more information.',
        'A team wins when they are the only ones that are alive at any point in the game. To make the game balanced, players are not distributed evenly among the two parties. The mafia always has fewer players than the town. Additionally, each role has a special ability that can be performed at night that may help steer the conversation to who belongs to the mafia. Each role is thoroughly described in the roles section.',
        'In order for a game to start there should be 7 players connected through the Web App or Facebook Messenger.'
    ];

    $scope.information['Phases'] = [
        'Each game consists of 10 turns. If no party has won after 10 turns, the game will result in a draw. A turn is completed once the day-voting-night phases have been completed.',
        'Day: Each turn starts in the day phase. This phase lasts for 90 seconds. Every alive player may speak with each other in this phase. Normally, players would try and pinpoint a mafia member with what they have discovered in the night phase. However, be careful who you trust, a mafia member may be trying to deceive you.',
        'Voting: The second phase of a turn. This phase lasts for 30 seconds. No one is allowed to speak during this phase. Each player can only vote once for the player they think is a mafia member. Don’t waste your vote, you may not change it. Take into account that whenever someone votes, it will be publicly announced to the rest of the players who he voted for.',
        'Night: The last phase of a turn. This phase lasts for 30 seconds. Only mafia members may speak during the night in order to plot their attack. However, each player has assigned a role that has a special ability that can be used during this phase. You may change the target of your special ability how many times you want before the night phase ends. At the end of the night phase, you will be notified if your special ability had any effect and if anyone was murdered.',
        'Note that dead players may speak at any phase with each other.'
    ];
}]);
