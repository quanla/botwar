"use strict";

(function () {

    angular.module('bw.main.create-challenge', [
        'bw.main.challenge.challenge-setup',
        'bw.main.create-challenge.condition-selector',
        'bw.unit-selector',
        'bw.main.challenge-api',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('create-challenge', {
                    url: '/create-challenge',
                    templateUrl: "angular/main/challenge/create-challenge/create-challenge.html",
                    controller: "create-challenge.ctrl"
                })
            ;
        }])
        
        .controller("create-challenge.ctrl", function($scope, UserStorage, BattleSetup, PositionGenerator, BotSource, $modal, ChallengeSetup) {

            $scope.options = {

            };

            $scope.challengeSetup = {
                width: 500,
                height: 500,
                sides: [
                    {
                        color: "blue",
                        units: [
                            {
                                type: "footman",
                                count: 1
                            },
                            {
                                type: "archer",
                                count: 0
                            },
                            {
                                type: "knight",
                                count: 0
                            }
                        ]
                    },
                    {
                        color: "red",
                        units: [
                            {
                                type: "footman",
                                count: 1
                            },
                            {
                                type: "archer",
                                count: 0
                            },
                            {
                                type: "knight",
                                count: 0
                            }
                        ]
                    }
                ]
            };

            UserStorage.loadUserBots().then(function (bots) {
                $scope.bots = bots;
                $scope.challengeSetup.sides[0].bot = bots[0];
                $scope.challengeSetup.sides[1].bot = bots[0];
            });

            $scope.showCodeEditor = false;

            function createGame() {
                $scope.game = ChallengeSetup.createGame($scope.challengeSetup);
                $scope.options.pause = true;
            }

            createGame();

            $scope.$watch("myUnits", function () {
                createGame();
            }, true);
            $scope.$watch("oppoUnits", function () {
                createGame();
            }, true);

            $scope.testFight = function () {
                createGame();
                $scope.options.pause = false;
            };

            $scope.showPublishConfirm = function () {
                $modal.open({
                    templateUrl: "angular/main/challenge/create-challenge/confirm-publish-modal.html",
                    controller: "create-challenge.confirm-modal.Ctrl",
                    resolve: { getBattleSetup: function() {return $scope.challengeSetup; } }
                });
            };
        })

        .controller("create-challenge.confirm-modal.Ctrl", function($scope, ChallengeServer, SecurityService, $modalInstance, getBattleSetup) {

            $scope.challenge = {
                battleSetup: getBattleSetup()
            };

            $scope.publish = function() {
                if (!SecurityService.isSignedIn()) {
                    SecurityService.showSigninModal().then(function() {
                        ChallengeServer.postChallenge($scope.challenge).success(function() {
                            $modalInstance.close();
                        });
                    });
                } else {
                    ChallengeServer.postChallenge($scope.challenge).success(function() {
                        $modalInstance.close();
                    });
                }
            };

            $scope.cancel = $modalInstance.dismiss;
        })


    ;

})();