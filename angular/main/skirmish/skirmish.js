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

        .directive("bwSkirmishBattlefield", function(BotSource, PositionGenerator, SkirmishStorage, BattleSetup) {
            return {
                restrict: "E",
                templateUrl: "angular/main/skirmish/skirmish-battlefield.html",
                link: function($scope, elem, attrs) {
                    function loadDefaultBattleSetup() {
                        var watchBots = $scope.$watch("bots != null", function(value) {
                            if (value) {
                                watchBots();

                                $scope.battleSetup = {
                                    sides: [
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
                                    ]
                                };

                                $scope.game = BattleSetup.createGame($scope.battleSetup, null, false);
                            }
                        });
                    }


                    $scope.startGame = function() {
                        //console.log($scope.battleSetup.continuous);
                        $scope.battleSetup.width = 500;
                        $scope.battleSetup.height = 500;
                        $scope.game = BattleSetup.createGame($scope.battleSetup, null, true);
                    };

                    $scope.$watch("battleSetup", function(value, old) {
                        if (value != null && old != null) {
                            $scope.game = BattleSetup.createGame($scope.battleSetup, null, false);
                            SkirmishStorage.saveBattleSetup($scope.battleSetup);
                        } else if (value == null) {
                            $scope.battleSetup = SkirmishStorage.loadBattleSetup($scope.bots);
                            if ($scope.battleSetup != null) {
                                $scope.game = BattleSetup.createGame($scope.battleSetup, null, false);
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
                saveBattleSetup: function(battleSetup) {
                    var toSave = ObjectUtil.clone(battleSetup);
                    for (var i = 0; i < toSave.sides.length; i++) {
                        var side = toSave.sides[i];
                        if (side.bot != null) {
                            delete side.bot.code;
                        }
                    }
                    localStorage["skirmish.battleSetup"] = JSON.stringify(toSave);
                },
                loadBattleSetup: function(bots) {
                    var loadStr = localStorage["skirmish.battleSetup"];
                    //loadStr = null;
                    if (loadStr == null) {
                        return null;
                    }
                    var battleSetup = JSON.parse(loadStr);
                    for (var i = 0; i < battleSetup.sides.length; i++) {
                        var side = battleSetup.sides[i];

                        var find = Cols.find(bots, function (bot) {
                            return bot.name == side.bot.name;
                        });
                        side.bot = find;
                    }
                    return battleSetup
                }
            };
        })
    ;

})();