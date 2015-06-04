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

            $scope.nextChallenge = function() {
                return $scope.challenges[$scope.challenges.indexOf($scope.challenge) + 1];
            };

            $scope.$watch("challenge", function(challenge) {
                $scope.finished = false;

                $scope.game = Challenges.setupGame($scope.challenge);
            });



            $scope.startGame = function() {
                $scope.game = Challenges.setupGame($scope.challenge, BotSource.createBot($scope.currentBot.code), function() {
                    $scope.$apply(function() {
                        $scope.finished = true;
                    });
                });
            };
        })

        .factory("Challenges", function() {

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
                    h2: "So you can fight!",
                    p: "Red guy's brother is angry, and he is coming for you. Get ready..."
                },
                messages: [
                    "Killing the Idle guy doesn't prove anything, this time you are not allowed to fight.",
                    "The Red guy will try to hit you, if you can dodge 3 times, he will be too tired to continue... then you will win.",
                ],
                congrats: {
                    h2: "Well done, he is on his knee now!",
                    p: "\"So in war, the way is to avoid what is strong, and strike at what is weak.\" -  Sun Tzu"
                }
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
                setupGame: function(challenge, userBot, onFinish) {
                    return {
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
                                        bot: null
                                    }
                                ]
                            }
                        ],
                        onFinish: onFinish
                    };
                }
            };
        })

    ;

})();