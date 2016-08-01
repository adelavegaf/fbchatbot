'use strict';

angular.module('mafiaApp').controller('RolesController', ['$scope', function ($scope) {
    $scope.title = 'Roles';

    $scope.tabItems = ['Detective', 'Doctor', 'Vigilante', 'Barman', 'Mafia Boss', 'Mafioso', 'Fixer'];

    $scope.selectedItem = '';

    $scope.information = {};

    $scope.selectItem = function (item) {
        $scope.selectedItem = item;
    };

    $scope.information['Doctor'] = [
        'Alliance: Town',
        'Special Ability: Whoever you choose to save will not die during that turn. You may also choose to save yourself, but be careful, you may only do that 2 times.',
        'The doctor has been living in this town for the last 40 years. He is one of the town’s most prestigious figures. He was born and raised here but he pursued his education in a nearby city. After hearing that his mother was sick he came back to town and has stayed here since. During the night he randomly visits different homes to see if they need his help. He treats everyone equally, he values life above anything else. With his education, there are no wounds he can’t heal.'
    ];

    $scope.information['Vigilante'] = [
        'Alliance: Town',
        'Special Ability: Kill. He may choose to kill anyone at will in the name of justice.',
        'During the recession, the vigilante’s family moved to the town looking for a job. They managed to run a small car repair shop down south for a couple of years. However, the Vigilante’s life changed when his parents were killed by a drunk driver. Although there was overwhelming evidence that compromised the drunk driver, he knew the right people and was eventually acquitted. This was when the Vigilante’s belief in the justice system started to collapse. Fast forward a couple of years and he is ready to take justice into his own hands.'
    ];

    $scope.information['Barman'] = [
        'Alliance: Town',
        'Special Ability: Block. He can make a player drink so much at night that he is unable to carry out his special ability during that turn.',
        'The barman used to live in the pub before he got a job there. He loved drinking for no particular reason. Everyone was compelled to drink with him; he was loved due to his joyful personality. Recently, the pub had been having a decrease in the number of customers it’s serving each night. The pub owners speculated it was due to the increased criminal presence in the town. As a countermeasure, the barman has just created a drinking challenge. Whoever is able to beat him in a chugging contest will earn a hefty reward. Anyone who he dares to participate ends up severely intoxicated.'
    ];

    $scope.information['Detective'] = [
        'Alliance: Town',
        'Special Ability: Investigate. He is able to find out a player’s role at night.',
        'The investigator has always been obsessed with finding out the truth. He is a very skeptical person. They sometimes attribute this behavior as the cause of him always having short relationships. This past week the police force assigned him the task of dismantling the mafia that had been growing in town. With his reputation at stake, he will do anything in his power to try and complete his task. Anyone is a suspect in his new case. However, he must be cautious, if not, the mafia may as well kill him.'
    ];


    $scope.information['Mafia Boss'] = [
        'Alliance: Mafia',
        'Special Ability: Kill. Taking into account what his associates tell him, he is able to kill at will any town member at night.',
        'Money and family first, everything else comes second. That is the Mafia Boss’ life motto. His close friends describe him as ruthless, gritty, and fair. It didn’t take him long to conquer the local crime scene. All unions and trafficking rings belong to him. However, it seems recently the feds have been getting closer and closer to him. We can only expect for him to retaliate the only way he knows how; with violence. He will do whatever it takes to protect his operation.'
    ];

    $scope.information['Mafioso'] = [
        'Alliance: Mafia',
        'Special Ability: None. He is second in line in the Mafia. If the mafia boss dies, he assumes control.',
        'Tired of being poor and with no other options left he decided to lend a hand to the mafia. After many years of doing the grunt work, the mafia boss finally gave him a break. He was put in charge of one of the most important money laundering operations the family had ever had. After a perfect operation, he was finally on the Mafia Boss’s map. Now, he is a respected figure inside the mafia. The Mafia Boss counts with him more than ever now that the feds are closing in.'
    ];

    $scope.information['Fixer'] = [
        'Alliance: Mafia',
        'Special Ability. Fix. He can disguise a mobster as a town member by switching his role at night.',
        'He has the brains and the connections. You have a problem, he takes cares of it. No one knows how he actually does it but he sure is effective. People speculate that he has a close relative down at the DOJ but it hasn’t been proven. During his childhood, he somehow always managed to get away from punishments. This dodgy behavior has carried on to his adulthood and now is at the center of his prosperous business. He was recently contacted by the Mafia to aid in their current situation. The pay was spectacular so it was a no-brainer decision.'
    ];
}]);
