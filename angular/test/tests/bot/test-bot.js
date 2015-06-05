"use strict";

(function () {

    angular.module('bw.test.bot', [
        'bw.sample',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('bot', {
                    url: '/bot',
                    templateUrl: "tests/bot/test-bot.html",
                    controller: "bw.test.bot.Ctrl"
                })
            ;
        }])

        .controller("bw.test.bot.Ctrl", function($scope, SampleFightBot, SampleRunBot, SampleVeteranBot, SampleArcherBot) {

            function randomGame(bot, eneBot) {
                var blueUnits = [];
                for (var i = 0; i < 1; i++) {
                    blueUnits.push({
                        type: "footman",
                        position: {x: 200, y: 50 + i * 50},
                        direction: 3 * Math.PI/4,
                        bot: bot
                    });
                }

                var redUnits = [];
                for (var i = 0; i < 1; i++) {
                    redUnits.push({
                        type: "archer",
                        position: {x: 400, y: 50 + i * 50},
                        direction: 3 * Math.PI/4,
                        bot: eneBot
                    });
                }

                return {
                    sides: [
                        {
                            color: "blue",
                            units: blueUnits
                        },
                        {
                            color: "red",
                            units: redUnits
                        }
                    ]
                };
            }

            var fightBot;
            SampleFightBot.createSampleBot(function(bot) {
                fightBot = bot;
            });

            var runBot;
            SampleRunBot.createSampleBot(function(bot) {
                runBot = bot;
            });

            var veteranBot;
            SampleVeteranBot.createSampleBot(function(bot) {
                 veteranBot = bot;
            });

            var archerBot;
            SampleArcherBot.createSampleBot(function(bot) {
                archerBot = bot;
            });

            $scope.testSlaughter = function() {
                $scope.game = randomGame(fightBot);
            };
            $scope.testRunAway = function() {
                $scope.game = randomGame(fightBot, runBot);
            };
            $scope.testFight = function() {
                $scope.game = randomGame(fightBot, fightBot);
            };
            $scope.testVeteran = function() {
                $scope.game = randomGame(fightBot, veteranBot);
            };
            $scope.testArcher = function() {
                $scope.game = randomGame(fightBot, archerBot);
            };

            $scope.testArcher();
        })
    ;

})();