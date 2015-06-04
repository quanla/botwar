"use strict";

(function () {

    angular.module('bw.main.challenges', [
        'bw.main.plugin.code-mirror',
        'bw.main.challenges.c1',
        'bw.main.challenges.c2',
        'bw.main.challenges.c3',
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

            $scope.challenges = Challenges.challenges;
            $scope.challenge = $scope.challenges[0];
            //$scope.challenge = $scope.challenges[2];

            $scope.nextChallenge = function() {
                return $scope.challenges[$scope.challenges.indexOf($scope.challenge) + 1];
            };
            $scope.toNextChallenge = function() {
                $scope.challenge = $scope.nextChallenge();
            };

            $scope.$watch("challenge", function() {
                $scope.finished = false;

                $scope.failMessage = null;

                $scope.game = Challenges.setupGame($scope.challenge);
            });

            $scope.jumbotron = function() {
                return $scope.failMessage || (!$scope.finished ? $scope.challenge.jumbotron : $scope.challenge.congrats);
            };

            $scope.startGame = function() {
                $scope.game = Challenges.setupGame($scope.challenge, BotSource.createBot($scope.currentBot.code),
                    function() {
                        $scope.$apply(function() {
                            $scope.failMessage = null;
                            $scope.finished = true;
                        });
                    },
                    function(failMessage) {
                        $scope.$apply(function() {
                            $scope.failMessage = failMessage || $scope.challenge.failMessage;
                        });
                    }
                );
            };
        })

        .factory("Challenges", function(SampleBot, BotSource,
                                        Challenge1, Challenge2, Challenge3) {

            var bots = {};
            var getBot = function(name) {
                return BotSource.createBot(bots[name]);
            };

            var challenges = [
                Challenge1,
                Challenge2,
                Challenge3
            ];

            return {
                getChallenge: function(index) {
                    return challenges[index];
                },
                challenges: challenges,
                setupGame: function(challenge, userBot, onFinish, onFail) {

                    var battleSetup = {};
                    if (challenge.battleSetup) {
                        battleSetup = challenge.battleSetup();
                        SampleBot.loadBot(battleSetup.redBot, function(source) {
                            bots[battleSetup.redBot] = source;
                        });
                    }

                    var game = {
                        sides: [
                            {
                                color: "blue",
                                units: [
                                    {
                                        type: "footman",
                                        position: {x: 100, y: 150},
                                        direction: (0) * Math.PI + Math.PI/2,
                                        bot: userBot
                                    }
                                ]
                            },
                            {
                                color: "red",
                                units: [
                                    {
                                        type: "footman",
                                        position: {x: 100 + 300, y: 150},
                                        direction: (1) * Math.PI + Math.PI/2,
                                        bot: userBot == null || battleSetup.redBot==null ? null : getBot(battleSetup.redBot),
                                        afterBotRun: battleSetup.afterRedBotRun
                                    }
                                ]
                            }
                        ],
                        afterRoundDynamics: battleSetup.afterRoundDynamics,
                        onFinish: function() {

                            //onFail
                            if (battleSetup.checkFinish == null) {
                                onFinish();
                            } else {
                                var checkFinish = battleSetup.checkFinish(game);
                                if (checkFinish) {
                                    onFail(checkFinish);
                                } else {
                                    onFinish();
                                }
                            }
                        }
                    };

                    battleSetup.game = game;

                    return game;
                }
            };
        })

    ;

})();