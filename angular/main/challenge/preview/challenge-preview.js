"use strict";

(function () {

    angular.module('bw.main.challenge.preview', [
    ])

        .directive("challengePreview", function(BattleSetup, Fancybox, WinConditions, ChallengeServer, $modal) {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/preview/challenge-preview.html",
                scope: {
                    challenge: "="
                },
                link: function($scope, elem, attrs) {

                    $scope.$watch("challenge", function(challenge) {
                        var challengeSetup = ObjectUtil.clone(challenge.challengeSetup);
                        challengeSetup.width = 410;
                        challengeSetup.height = 410;
                        $scope.game = BattleSetup.createGame(challengeSetup, false);

                        $scope.countReplies = null;
                        ChallengeServer.countReplies(challenge).success(function(count) {
                            $scope.countReplies = count;
                        });
                    });
                    $scope.tryBattle = function() {
                        Fancybox.open($scope, {
                            templateUrl: "angular/main/challenge/preview/try-battle-fmodal.html",
                            width: 1000,
                            controller: "bw.main.challenge.preview.try-battle.Ctrl"
                        });
                    };

                    $scope.getDisplay = WinConditions.getDisplay;

                    $scope.plusone = function(params) {
                        ChallengeServer.plusoneChallenge($scope.challenge, params.state).success(function(count) {
                            $scope.challenge.plusone = count;
                        });
                    };
                    $scope.viewReply = function() {
                        $modal.open({
                            templateUrl: "angular/main/challenge/preview/view-challenge-reply-modal.html",
                            resolve: {
                                challenge: function() { return $scope.challenge; }
                            },
                            controller: "bw.main.challenge.preview.view-challenge-reply-modal.Ctrl"
                        });
                    };
                }
            };
        })

        .controller("bw.main.challenge.preview.view-challenge-reply-modal.Ctrl", function($scope, ChallengeSetup, $modalInstance, challenge, ChallengeServer) {
            $scope.options = {};

            challenge.challengeSetup.onFinish = function() {
                $scope.$applyAsync();
            };

            ChallengeServer.getReply(challenge).success(function(reply) {
                $scope.reply = reply;
            });

            $scope.$watch("reply", function(reply) {
                if (reply) {
                    if ($scope.nextReply == null) {
                        ChallengeServer.getNextReply(challenge, reply).success(function(nextReply) {
                            if (nextReply=="") return;
                            $scope.nextReply = nextReply;
                        });
                    }
                    if ($scope.prevReply == null) {
                        ChallengeServer.getPrevReply(challenge, reply).success(function(prevReply) {
                            if (prevReply=="") return;
                            $scope.prevReply = prevReply;
                        });
                    }

                    challenge.challengeSetup.sides[0].bot = reply.bot;
                    $scope.game = ChallengeSetup.createGame(challenge.challengeSetup, true);
                }
            });

            $scope.toPrevReply = function() {
                $scope.nextReply = $scope.reply;
                $scope.reply = $scope.prevReply;
                $scope.prevReply = null;
            };

            $scope.toNextReply = function() {
                $scope.prevReply = $scope.reply;
                $scope.reply = $scope.nextReply;
                $scope.nextReply = null;
            };


            $scope.restartGame = function() {
                $scope.game = ChallengeSetup.createGame(challenge.challengeSetup, true);
            };

            $scope.cancel = $modalInstance.dismiss;

        })

        .controller("bw.main.challenge.preview.try-battle.Ctrl", function($scope, ChallengeSetup, SecurityService, ChallengeServer, UserStorage, WinConditions) {
            $scope.reply = {};
            $scope.post = false;

            $scope.$watch("challenge.challengeSetup.sides[0].bot", function(value) {
                $scope.game = ChallengeSetup.createGame($scope.challenge.challengeSetup, false);
                $scope.options.pause = true;
            });


            UserStorage.loadUserBots().then(function (bots) {
                $scope.bots = bots;
                $scope.challenge.challengeSetup.sides[0].bot = bots[0];
            });

            $scope.options = { pause: true };

            $scope.challenge.challengeSetup.onFinish = function() {
                $scope.$applyAsync();
            };
            $scope.startGame = function() {
                $scope.game = ChallengeSetup.createGame($scope.challenge.challengeSetup, true);
                $scope.options.pause = false;
            };

            $scope.getDisplay = WinConditions.getDisplay;

            $scope.postVictory = function() {

                SecurityService.ensureSignin().then(function() {
                    ChallengeServer.postReply({
                        toChallenge: $scope.challenge.id,
                        message: $scope.reply.message,
                        bot: $scope.challenge.challengeSetup.sides[0].bot
                    }).then(function() {
                        $scope.post = true;
                    });
                });
            };
        })
    ;

})();