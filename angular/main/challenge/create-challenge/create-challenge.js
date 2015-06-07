"use strict";

(function () {

    angular.module('bw.main.create-challenge', [
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
        
        .controller("create-challenge.ctrl", function($scope, User, BattleSetup, PositionGenerator, BotSource, $modal) {
            User.loadUserBots().then(function (bots) {
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
                }
            ];
            $scope.oppoUnits = [
                {
                    type: "footman",
                    count: 1
                }
            ];

            function createGame() {
                $scope.game = BattleSetup.createGame(createBattleSetup());
            }

            createGame();

            $scope.$watch("myUnits", function () {
                createGame();
            }, true);
            $scope.$watch("oppoUnits", function () {
                createGame();
            }, true);

            $scope.testFight = function () {
                createGame($scope.myChampion, $scope.oppoBot);
            };


            function createBattleSetup() {
                return {
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

        .factory("BattleSetup", function(PositionGenerator, BotSource) {
            return {
                createGame: function(battleSetup, blueBot) {

                    var sides = [];

                    function addSide(sideNum, side, blueBot) {
                        var units = [];
                        var positions = PositionGenerator.generatePositions(sideNum, side.units);
                        for (var j = 0; j < side.units.length; j++) {
                            var unitConfig = side.units[j];
                            for (var k = 0; k < unitConfig.count; k++) {
                                units.push({
                                    type: unitConfig.type,
                                    position: positions(),
                                    direction: sideNum * Math.PI + Math.PI / 2,
                                    bot: sideNum == 0 ? (!blueBot ? null : BotSource.createBot(blueBot.code)) :
                                            side.bot == null || !blueBot ? null : BotSource.createBot(side.bot.code)
                                });
                            }
                        }
                        sides.push({
                            color: sideNum == 0 ? "blue" : "red",
                            units: units
                        });
                    }

                    addSide(0, battleSetup.sides[0], blueBot);
                    addSide(1, battleSetup.sides[1], blueBot);

                    return {
                        sides: sides
                    };
                }
            };
        })

        .controller("create-challenge.confirm-modal.Ctrl", function($scope, ChallengeServer, $modalInstance, getBattleSetup) {

            $scope.challenge = {
                battleSetup: getBattleSetup()
            };

            $scope.publish = function() {
                ChallengeServer.postChallenge($scope.challenge);
            };

            $scope.cancel = $modalInstance.dismiss;
        })

        .directive("unitsSelector", function() {
            return {
                restrict: "E",
                scope: {
                    "units": "="
                },
                templateUrl: "angular/main/challenge/create-challenge/units-selector.html",
                link: function($scope, elem, attrs) {

                    $scope.addUnit = function(unit) {
                        if (unit.count >= 5) return;
                        unit.count ++;
                    };

                    $scope.removeUnit = function(unit) {
                        if (unit.count <= 1) return;
                        unit.count --;
                    };

                }
            };
        })

        .factory("PositionGenerator", function() {
            return {
                generatePositions: function(side, unitConfigs) {
                    var i=0;
                    return function() {
                        return {x: side*300 + 100, y: 150 + (i++) * 50};
                    }
                }
            };
        })
    ;

})();