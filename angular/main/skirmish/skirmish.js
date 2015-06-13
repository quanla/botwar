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

        .directive("bwSkirmishBattlefield", function(BotSource, PositionGenerator, SkirmishStorage) {
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

                    function loadDefaultBattleSetup() {
                        var watchBots = $scope.$watch("bots != null", function(value) {
                            if (value) {
                                watchBots();

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
                    }


                    $scope.startGame = function() {
                        $scope.game = createGame(true);
                    };

                    $scope.$watch("sides", function(value, old) {
                        if (value != null && old != null) {
                            $scope.game = createGame(false);
                            SkirmishStorage.saveGameSetup($scope.sides);
                        } else if (value == null) {
                            $scope.sides = SkirmishStorage.loadGameSetup($scope.bots);
                            if ($scope.sides != null) {
                                $scope.game = createGame(false);
                            } else {
                                loadDefaultBattleSetup();
                            }
                        }

                    }, true);
                }
            };
        })

        .factory("SkirmishStorage", function() {
            return {
                saveGameSetup: function(sides) {
                    var toSave = ObjectUtil.clone(sides);
                    for (var i = 0; i < toSave.length; i++) {
                        var side = toSave[i];
                        if (side.bot != null) {
                            delete side.bot.code;
                        }
                    }
                    localStorage["skirmish.sides"] = JSON.stringify(toSave);
                },
                loadGameSetup: function(bots) {
                    var loadStr = localStorage["skirmish.sides"];
                    //loadStr = null;
                    if (loadStr == null) {
                        return null;
                    }
                    var sides = JSON.parse(loadStr);
                    for (var i = 0; i < sides.length; i++) {
                        var side = sides[i];

                        var find = Cols.find(bots, function (bot) {
                            return bot.name == side.bot.name;
                        });
                        side.bot = find;
                    }
                    return sides
                }
            };
        })
    ;

})();