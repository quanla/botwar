"use strict";

(function () {

    angular.module('bw.main.challenges', [
        'bw.main.plugin.code-mirror',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('challenges', {
                    url: '/challenges',
                    templateUrl: "angular/main/challenges/challenges.html",
                    controller: "challenges.ctrl"
                })
            ;
        }])

        .controller("challenges.ctrl", function(User, $scope, BotSource, Challenges) {
            User.loadUserBots().then(function(bots) {
                $scope.bots = bots;
                $scope.currentBot = bots[0];
            });
            $scope.showCodeEditor = false;

            $scope.changeBot = function(bot) {
                $scope.currentBot = bot;
            };

            $scope.challenge = Challenges.getChallenge();

            function createGame(bot, eneBot) {
                return {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 0*300 + 100, y: 150},
                                    direction: (0) * Math.PI + Math.PI/2,
                                    bot: bot
                                }
                            ]
                        },
                        {
                            color: "red",
                            units: [
                                {
                                    type: "footman",
                                    position: {x: 1*300 + 100, y: 150},
                                    direction: (1) * Math.PI + Math.PI/2,
                                    bot: eneBot
                                }
                            ]
                        }
                    ],
                    onFinish: function() {

                    }
                };
            }

            $scope.game = createGame();
            $scope.startGame = function() {
                $scope.game = createGame(BotSource.createBot($scope.currentBot.code));
            };
        })

        .factory("Challenges", function() {
            return {
                getChallenge: function() {
                    return {
                        jumbotron: {
                            h2: "Hi there!",
                            p: "Welcome to the Arena, where your bot will take challenges from various battle hardened " +
                            "warriors"
                        }
                    };
                }
            };
        })

    ;

})();