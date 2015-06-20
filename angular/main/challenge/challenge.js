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

        .controller("challenge.ctrl", function($scope, $state, ChallengeServer, UserStorage) {
            $scope.view = {
            };

            ChallengeServer.getChallenges().success(function(challenges) {
                $scope.challenges = challenges;
            });
        })

        .directive("challengeBattlePreview", function(BattleSetup, UserStorage) {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/challenge-battle-preview.html",
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

        .directive("challengeRow", function(User, ChallengeServer) {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {

                    $scope.isMine = function() {
                        if (User.google == null) {
                            return null;
                        }
                        return $scope.challenge.fromAuthenType == "google" && $scope.challenge.fromEmail == User.google.email;
                    };

                    $scope.deleteChallenge = function() {
                        ChallengeServer.deleteChallenge($scope.challenge.id).success(function() {
                            Cols.remove($scope.challenge, $scope.challenges);
                        });
                    };
                }
            };
        })
    ;

})();