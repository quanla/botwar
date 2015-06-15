"use strict";

(function () {

    angular.module('bw.main.create-challenge', [
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
        
        .controller("create-challenge.ctrl", function($scope, UserStorage, BattleSetup, PositionGenerator, BotSource, $modal) {
            UserStorage.loadUserBots().then(function (bots) {
                $scope.bots = bots;
                $scope.myChampion = bots[0];
                $scope.oppoBot = bots[0];
            });

            $scope.showCodeEditor = false;

            $scope.changeBot = function (bot) {
                $scope.myChampion = bot;
            };

            $scope.myUnits = [
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
            ];
            $scope.oppoUnits = [
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
            ];

            function createGame(oppoBot) {
                $scope.game = BattleSetup.createGame(createBattleSetup(), oppoBot, oppoBot!=null);
            }

            createGame();

            $scope.$watch("myUnits", function () {
                createGame();
            }, true);
            $scope.$watch("oppoUnits", function () {
                createGame();
            }, true);

            $scope.testFight = function () {
                createGame($scope.oppoBot);
            };


            function createBattleSetup() {
                return {
                    width: 500,
                    height: 500,
                    sides: [
                        {
                            color: "blue",
                            units: $scope.oppoUnits
                        },
                        {
                            color: "red",
                            units: $scope.myUnits,
                            bot: $scope.myChampion
                        }
                    ]
                };
            }


            $scope.showPublishConfirm = function () {
                $modal.open({
                    templateUrl: "angular/main/challenge/create-challenge/confirm-publish-modal.html",
                    controller: "create-challenge.confirm-modal.Ctrl",
                    resolve: { getBattleSetup: function() {return createBattleSetup; } }
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