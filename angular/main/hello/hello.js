"use strict";

(function () {
    /* App Module */
    angular.module("bw.main.hello", [
        'bw.sample',
        'bw.fancybox',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('hello', {
                    url: '/hello',
                    templateUrl: "angular/main/hello/hello.html",
                    controller: "bw.main.hello.Ctrl"
                })
            ;
        }])

        .controller("bw.main.hello.large-battle.Ctrl", function($scope, BattleSetup, SampleBot) {

            SampleBot.loadBot("flex", function(botCode) {
                var fightBot = {name: "Fighter", code: botCode};

                $scope.game = BattleSetup.createGame({
                    sides: [
                        {
                            color: "blue",
                            units: [
                                { type: "footman", count: 10},
                                { type: "archer", count: 10},
                                { type: "knight", count: 4}
                            ],
                            bot: fightBot
                        },
                        {
                            color: "red",
                            units: [
                                { type: "footman", count: 10},
                                { type: "archer", count: 10},
                                { type: "knight", count: 4}
                            ],
                            bot: fightBot
                        }
                    ],
                    width: 940,
                    height: 740,
                    continuous: true
                }, true);
            });


            $scope.options = {};
        })

        .controller("bw.main.hello.Ctrl", function($scope, SampleBot, Fancybox) {
            $scope.showLargeBattle = function() {
                Fancybox.open($scope, {
                    templateUrl: "angular/main/hello/large-battle.html",
                    width: 1000,
                    controller: "bw.main.hello.large-battle.Ctrl"
                });
            };
            //$scope.showLargeBattle();

            $scope.step1 = true;
            //$scope.step2 = true;
            //$scope.step3 = true;

            $scope.showStep = function(i) {
                $scope["step" + i] = true;
            };

            SampleBot.loadBot("fight", function(bot) {
                $scope.fightBot = bot;
            });
            SampleBot.loadBot("run", function(bot) {
                $scope.runBot = bot;
            });
            SampleBot.loadBot("veteran", function(bot) {
                $scope.veteranBot = bot;
            });
        })

        .controller("bw.main.hello.step1.Ctrl", function($scope, BattleSetup) {
            $scope.options = {pause: true};

            $scope.$watch("::fightBot", function(fightBot) {
                if (!fightBot) return;

                $scope.game = BattleSetup.createGame({
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    count: 1
                                }
                            ],
                            bot: {code: $scope.fightBot}
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "grunt",
                                    count: 1
                                }
                            ],
                            bot: {code: $scope.fightBot}
                        }
                    ],
                    width: 440,
                    height: 440,
                    onFinish: function() {
                        $scope.$apply();
                    }
                }, true);
            });

            $scope.startGame = function() {
                $scope.options.pause = false;
            };

        })

        .controller("bw.main.hello.step2.Ctrl", function($scope, BattleSetup) {
            $scope.options = {pause: true};

            $scope.$watch("fightBot && runBot", function(v) {
                if (!v) return;


                $scope.game = BattleSetup.createGame({
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    count: 1
                                }
                            ],
                            bot: {code: $scope.fightBot}
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "grunt",
                                    count: 1
                                }
                            ],
                            bot: {code: $scope.runBot}
                        }
                    ],
                    width: 440,
                    height: 440,
                    onFinish: function() {
                        $scope.$apply();
                    }
                }, true);

            });

            $scope.startGame = function() {
                $scope.options.pause = false;
            };

        })

        .controller("bw.main.hello.step3.Ctrl", function($scope, BattleSetup) {
            $scope.options = {pause: true};


            $scope.$watch("veteranBot && fightBot", function(v) {
                if (!v) return;
                newGame();
            });


            function newGame() {

                $scope.game = BattleSetup.createGame({
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    count: 1
                                }
                            ],
                            bot: {code: $scope.fightBot}
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "grunt",
                                    count: 1
                                }
                            ],
                            bot: {code: $scope.veteranBot}
                        }
                    ],
                    width: 440,
                    height: 440,
                    onFinish: function() {
                        $scope.$apply();
                    }
                }, true);

            }

            $scope.startGame = function() {
                if ($scope.options.pause) {
                    $scope.options.pause = false;
                } else {
                    newGame();
                }
            };


        })

    ;
})();
