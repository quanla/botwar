"use strict";

(function () {

    angular.module('bw.main.challenge.preview', [
    ])

        .directive("challengeBattlePreview", function(BattleSetup, UserStorage) {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/preview/challenge-preview.html",
                scope: {
                    challenge: "="
                },
                link: function($scope, elem, attrs) {
                    UserStorage.loadUserBots().then(function (bots) {
                        $scope.bots = bots;
                    });

                    $scope.$watch("challenge", function(challenge) {
                        var challengeSetup = ObjectUtil.clone(challenge.challengeSetup);
                        challengeSetup.width = 400;
                        challengeSetup.height = 400;
                        $scope.game = BattleSetup.createGame(challengeSetup, false);
                    });

                }
            };
        })

    ;

})();