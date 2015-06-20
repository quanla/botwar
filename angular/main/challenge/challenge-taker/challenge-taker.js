"use strict";

(function () {

    angular.module('bw.main.challenge.challenge-taker', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('challenge-take', {
                    url: '/challenge-take/:challengeId',
                    templateUrl: "angular/main/challenge/challenge-taker/challenge-taker.html",
                    controller: "challenge-taker.ctrl"
                })
            ;
        }])

        .controller("challenge-taker.ctrl", function(UserStorage, $scope, $stateParams, BotSource, BattleSetup, ChallengeServer, LayoutService) {

            $scope.options = {};

            UserStorage.loadUserBots().then(function(bots) {
                $scope.bots = bots;

                ChallengeServer.getChallenge($stateParams.challengeId).success(function(challenge) {
                    LayoutService.setTitle($scope, challenge.title + " - BotwarJS");
                    $scope.challenge = challenge;
                    $scope.game = BattleSetup.createGame(challenge.challengeSetup, false);
                    $scope.options.pause = true;
                    $scope.challenge.challengeSetup.sides[0].bot = $scope.bots[0];

                    $scope.challenge.challengeSetup.onFinish = function() {
                        $scope.$applyAsync();
                    }
                });
            });
            $scope.showCodeEditor = false;

            $scope.startGame = function() {
                $scope.game = BattleSetup.createGame($scope.challenge.challengeSetup, true);
                $scope.options.pause = false;
            }
        })

    ;

})();