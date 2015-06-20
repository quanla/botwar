"use strict";

(function () {

    angular.module('bw.main.challenge.preview', [
    ])

        .directive("challengePreview", function(BattleSetup, Fancybox, WinConditions, ChallengeServer) {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/preview/challenge-preview.html",
                scope: {
                    challenge: "="
                },
                link: function($scope, elem, attrs) {

                    $scope.$watch("challenge", function(challenge) {
                        var challengeSetup = ObjectUtil.clone(challenge.challengeSetup);
                        challengeSetup.width = 410;
                        challengeSetup.height = 410;
                        $scope.game = BattleSetup.createGame(challengeSetup, false);
                    });
                    $scope.tryBattle = function() {
                        Fancybox.open($scope, {
                            templateUrl: "angular/main/challenge/preview/try-battle-fmodal.html",
                            width: 1000,
                            controller: "bw.main.challenge.preview.try-battle.Ctrl"
                        });
                    };

                    $scope.getDisplay = WinConditions.getDisplay;

                    $scope.plusone = function(params) {
                        ChallengeServer.plusoneChallenge($scope.challenge, params.state).success(function(count) {
                            $scope.challenge.plusone = count;
                        });
                    };
                }
            };
        })


        .controller("bw.main.challenge.preview.try-battle.Ctrl", function($scope, ChallengeSetup, UserStorage, WinConditions) {
            $scope.$watch("challenge.challengeSetup.sides[0].bot", function(value) {
                $scope.game = ChallengeSetup.createGame($scope.challenge.challengeSetup, false);
                $scope.options.pause = true;
            });


            UserStorage.loadUserBots().then(function (bots) {
                $scope.bots = bots;
                $scope.challenge.challengeSetup.sides[0].bot = bots[0];
            });

            $scope.options = { pause: true };

            $scope.challenge.challengeSetup.onFinish = function() {
                $scope.$applyAsync();
            };
            $scope.startGame = function() {
                $scope.game = ChallengeSetup.createGame($scope.challenge.challengeSetup, true);
                $scope.options.pause = false;
            };

            $scope.getDisplay = WinConditions.getDisplay;
        })
    ;

})();