"use strict";

(function () {

    angular.module('bw.main.skirmish', [
        'bw.main.ide',
        'bw.unit-selector',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('skirmish', {
                    url: '/skirmish',
                    templateUrl: "angular/main/skirmish/skirmish.html",
                    controller: "skirmish.ctrl"
                })
            ;
        }])

        .controller("skirmish.ctrl", function(SampleBot, $scope, User) {

            User.loadUserBots().then(function(bots) {
                $scope.bots = bots;
            });
            $scope.showCodeEditor = false;
        })

        .directive("bwSkirmishBattlefield", function(BotSource, PositionGenerator) {
            return {
                restrict: "E",
                templateUrl: "angular/main/skirmish/skirmish-battlefield.html",
                link: function($scope, elem, attrs) {

                    function createGame(hasBot) {
                        var sides = [];

                        for (var i = 0; i < $scope.sides.length; i++) {
                            var sideConfig = $scope.sides[i];
                            var units = [];
                            var positions = PositionGenerator.generatePositions(i, sideConfig.units, 500, 500);

                            for (var j = 0; j < sideConfig.units.length; j++) {
                                var unitConfig = sideConfig.units[j];

                                for (var k = 0; k < unitConfig.count; k++) {
                                    units.push({
                                        type: unitConfig.type,
                                        position: positions(unitConfig.type),
                                        direction: (i) * Math.PI + Math.PI/2,
                                        bot: hasBot ? BotSource.createBot(sideConfig.bot.code, unitConfig.type) : null
                                    });
                                }
                            }
                            sides.push({
                                color: sideConfig.color,
                                units: units
                            })
                        }
                        return {
                            sides: sides
                        };
                    }

                    var awefwaef = $scope.$watch("bots[0].code != null", function(value) {
                        if (value) {
                            awefwaef();

                            $scope.sides = [
                                {
                                    color: "blue",
                                    units: [
                                        {
                                            type: "footman",
                                            count: 2
                                        },
                                        {
                                            type: "archer",
                                            count: 1
                                        },
                                        {
                                            type: "knight",
                                            count: 0
                                        }
                                    ],
                                    bot: $scope.bots[0]
                                },
                                {
                                    color: "red",
                                    units: [
                                        {
                                            type: "footman",
                                            count: 2
                                        },
                                        {
                                            type: "archer",
                                            count: 1
                                        },
                                        {
                                            type: "knight",
                                            count: 0
                                        }
                                    ],
                                    bot: $scope.bots[1]
                                }
                            ];

                            $scope.game = createGame(false);
                        }
                    });


                    $scope.startGame = function() {
                        $scope.game = createGame(true);
                    };

                    $scope.$watch("sides", function(value) {
                        $scope.game = createGame(false);
                    }, true);


                    $scope.addBot = function(unit) {
                        if (unit.count >= 10) return;
                        unit.count ++;
                    };

                    $scope.removeBot = function(unit) {
                        if (unit.count <= 1) return;
                        unit.count --;
                    }
                }
            };
        })
    ;

})();