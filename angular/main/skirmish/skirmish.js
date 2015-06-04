"use strict";

(function () {

    angular.module('bw.main.skirmish', [
        'bw.main.ide',
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

        .directive("bwSkirmishBattlefield", function(BotSource) {
            return {
                restrict: "E",
                templateUrl: "angular/main/skirmish/skirmish-battlefield.html",
                link: function($scope, elem, attrs) {

                    $scope.sides = [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    count: 1,
                                    bot: $scope.bots[0]
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    count: 1,
                                    bot: $scope.bots[0]
                                }
                            ]
                        }
                    ];

                    function createGame() {
                        var sides = [];

                        for (var i = 0; i < $scope.sides.length; i++) {
                            var sideConfig = $scope.sides[i];
                            var units = [];
                            for (var j = 0; j < sideConfig.units.length; j++) {
                                var unitConfig = sideConfig.units[j];

                                for (var k = 0; k < unitConfig.count; k++) {
                                    var bot = BotSource.createBot(unitConfig.bot.code);
                                    units.push({
                                        type: unitConfig.type,
                                        position: {x: (i) * 300 + 100, y: 150 + k * 50},
                                        direction: (i) * Math.PI + Math.PI/2,
                                        bot: bot
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

                    $scope.options = { pause: true };

                    var awefwaef = $scope.$watch("bots[0].code", function(value) {
                        if (value) {
                            awefwaef();
                            $scope.game = createGame();
                        }
                    });


                    $scope.startGame = function() {
                        if (!$scope.game.isFinished && $scope.options.pause) {
                            $scope.game = createGame();
                            $scope.options.pause = false;
                        } else if (!$scope.game.isFinished && !$scope.options.pause) {
                            $scope.game = createGame();
                            $scope.options.pause = true;
                        }
                    };

                    $scope.addBot = function(unit) {
                        if (unit.count >= 5) return;
                        unit.count ++;

                        $scope.game = createGame();
                    };

                    $scope.removeBot = function(unit) {
                        if (unit.count <= 1) return;
                        unit.count --;

                        $scope.game = createGame();
                    }
                }
            };
        })
    ;

})();