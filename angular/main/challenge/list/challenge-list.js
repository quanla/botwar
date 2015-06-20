"use strict";

(function () {

    angular.module('bw.main.challenge.list', [
        'bw.main.challenge.preview',
        'bw.main.create-challenge',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('challenge', {
                    url: '/challenge',
                    templateUrl: "angular/main/challenge/list/challenge-list.html",
                    controller: "challenge-list.ctrl"
                })
            ;
        }])

        .controller("challenge-list.ctrl", function($scope, $state, ChallengeServer) {
            $scope.view = {
            };

            ChallengeServer.getChallenges().success(function(challenges) {
                $scope.challenges = challenges;
            });
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