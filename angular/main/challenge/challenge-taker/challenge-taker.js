"use strict";

(function () {

    angular.module('bw.main.challenge.challenge-taker', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('challenge-taker', {
                    url: '/challenge-taker/:challengeId',
                    templateUrl: "angular/main/challenge/challenge-taker/challenge-taker.html",
                    controller: "challenge-taker.ctrl"
                })
            ;
        }])

        .controller("challenge-taker.ctrl", function(User, $scope, $stateParams, BotSource, BattleSetup, ChallengeServer) {

            ChallengeServer.getChallenge($stateParams.challengeId).success(function(challenge) {
                $scope.challenge = challenge;
                $scope.game = BattleSetup.createGame(challenge.battleSetup);
            });

            User.loadUserBots().then(function(bots) {
                $scope.bots = bots;
                $scope.currentBot = bots[0];
            });
            $scope.showCodeEditor = false;


            $scope.changeBot = function(bot) {
                $scope.currentBot = bot;
            };
        })

    ;

})();