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

            $scope.challenges = Challenges.challenges;
            $scope.challenge = $scope.challenges[0];
            //$scope.challenge = $scope.challenges[1];

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

        .factory("Challenges", function(SampleBot, BotSource) {

            var challenge1 = {
                name: "Challenge 1 - Idle bot",
                jumbotron: {
                    h2: "Hi there!",
                    p: "Welcome to the Arena, where your bot will take challenges from various battle hardened " +
                    "warriors"
                },
                messages: [
                    "The first fight will be rather easy. Your opponent will not move or fight, he only stares at you.",
                    "Man, he doesn't care to live anymore, finish him."
                ],
                congrats: {
                    h2: "Well done, you finished him!",
                    p: "Please don't feel bad for him, he doesn't feel a thing"
                }
            };

            var challenge2 = {
                name: "Challenge 2 - Now... dodge",
                intro: "This time you won't be allowed to fight",
                jumbotron: {
                    h2: "So you can fight, huh?",
                    p: "Red guy's brother is angry, and he is coming for you. Get ready..."
                },
                messages: [
                    "Killing the Idle guy doesn't prove anything, this time you are not allowed to fight.",
                    "The Red guy's brother will try to hit you, if you can dodge 3 times, he will be too tired to " +
                    "continue... then you will win."
                ],
                congrats: {
                    h2: "Well done, he is on his knee now!",
                    p: "\"So in war, the way is to avoid what is strong, and strike at what is weak.\" -  Sun Tzu"
                },
                battleSetup: function() {
                    var countHit = 0;

                    var setup;
                    return setup = {
                        redBot: "fight",
                        checkFinish: function(game) {

                            var blue = game.sides[0].units[0];
                            console.log(blue.state);
                            if (blue.state != null && blue.state.name == "die") {
                                return {
                                    h2: "Oh no, he killed you!",
                                    p: "Run faster next time will you..."
                                };
                            }

                            var red = game.sides[1].units[0];
                            if (red.state != null && red.state.name == "die") {
                                return {
                                    h2: "Oh no, don't kill him!",
                                    p: "I know you are strong, but this time, run..."
                                };
                            }
                        },
                        afterRedBotRun: function(unit) {
                            if (unit.state != null && unit.state.name == "fight") {
                                countHit++;
                                if (countHit == 3) {
                                    unit.state = null;
                                    setTimeout(function() {
                                        setup.game.finish();
                                    }, 1000);
                                }
                            }
                        }
                    };
                }
            };

            var bots = {};
            var getBot = function(name) {
                return BotSource.createBot(bots[name]);
            };

            var challenges = [
                challenge1,
                challenge2
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
                                        position: {x: 0*300 + 100, y: 150},
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
                                        position: {x: 1*300 + 100, y: 150},
                                        direction: (1) * Math.PI + Math.PI/2,
                                        bot: userBot == null || battleSetup.redBot==null ? null : getBot(battleSetup.redBot),
                                        afterBotRun: battleSetup.afterRedBotRun
                                    }
                                ]
                            }
                        ],
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