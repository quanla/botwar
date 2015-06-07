"use strict";

(function () {

    angular.module('bw.main.challenge', [
        'bw.main.create-challenge',
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

        .controller("challenge.ctrl", function($scope, $state, ChallengeServer) {
            $scope.view = {

            };

            ChallengeServer.getChallenges().success(function(challenges) {
                $scope.challenges = challenges;
            });
        })

        .directive("challengeBattlePreview", function(BattleSetup) {
            return {
                restrict: "A",
                templateUrl: "angular/main/challenge/challenge-battle-preview.html",
                link: function($scope, elem, attrs) {
                    $scope.game = BattleSetup.createGame($scope.challenge.battleSetup, false);
                }
            };
        })
    ;

})();