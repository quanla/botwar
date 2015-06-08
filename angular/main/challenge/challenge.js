"use strict";

(function () {

    angular.module('bw.main.challenge', [
        'bw.main.create-challenge',
        'bw.main.challenge.challenge-taker',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('challenge', {
                    url: '/challenge',
                    templateUrl: "angular/main/challenge/challenge.html",
                    controller: "challenge.ctrl"
                })
            ;
        }])

        .controller("challenge.ctrl", function($scope, $state, ChallengeServer, User) {
            $scope.view = {

            };

            User.loadUserBots().then(function (bots) {
                $scope.bots = bots;
            });


            ChallengeServer.getChallenges().success(function(challenges) {
                $scope.challenges = challenges;
            });
        })

        .directive("challengeBattlePreview", function(BattleSetup) {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/challenge-battle-preview.html",
                link: function($scope, elem, attrs) {
                    $scope.game = BattleSetup.createGame($scope.challenge.battleSetup, false);

                    var recentlyUseBot;
                    $scope.testBattle = function(myBot) {
                        recentlyUseBot = myBot;
                        $scope.game = BattleSetup.createGame($scope.challenge.battleSetup, myBot)
                    };


                }
            };
        })
    ;

})();