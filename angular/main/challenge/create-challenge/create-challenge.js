"use strict";

(function () {

    angular.module('bw.main.create-challenge', [
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
        
        .controller("create-challenge.ctrl", function($scope, User, PositionGenerator, BotSource, $modal) {
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

            function createGame(myBot, oppoBot) {

                var sides = [];

                function addSide(sideNum, unitConfigs, bot) {
                    var units = [];
                    var positions = PositionGenerator.generatePositions(sideNum, unitConfigs);
                    for (var j = 0; j < unitConfigs.length; j++) {
                        var unitConfig = unitConfigs[j];
                        for (var k = 0; k < unitConfig.count; k++) {
                            units.push({
                                type: unitConfig.type,
                                position: positions(),
                                direction: sideNum * Math.PI + Math.PI / 2,
                                bot: bot == null ? null : BotSource.createBot(bot.code)
                            });
                        }
                    }
                    sides.push({
                        color: sideNum == 0 ? "blue" : "red",
                        units: units
                    });
                }

                addSide(0, $scope.oppoUnits, oppoBot);
                addSide(1, $scope.myUnits, myBot);
                $scope.game = {
                    sides: sides
                };
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


            $scope.showPublishConfirm = function () {
                $modal.open({
                    templateUrl: "angular/main/challenge/create-challenge/confirm-publish-modal.html",
                    controller: "create-challenge.confirm-modal.Ctrl"
                });
            };
        })

        .controller("create-challenge.confirm-modal.Ctrl", function($scope) {

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