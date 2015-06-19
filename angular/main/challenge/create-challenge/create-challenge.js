"use strict";

(function () {

    angular.module('bw.main.create-challenge', [
        'bw.main.challenge.challenge-setup',
        'bw.main.challenge.condition-selector',
        'bw.unit-selector',
        'bw.main.challenge-api',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('create-challenge', {
                    url: '/create-challenge',
                    templateUrl: "angular/main/challenge/create-challenge/create-challenge.html",
                    controller: "create-challenge.ctrl"
                })
            ;
        }])
        
        .controller("create-challenge.ctrl", function($scope, UserStorage, PositionGenerator, BotSource, $modal, ChallengeSetup, ChallengeStorage) {

            $scope.options = {
            };

            function loadDefaultChallengeSetup() {
                $scope.challengeSetup = {
                    width: 500,
                    height: 500,
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: "footman",
                                    count: 1
                                },
                                {
                                    type: "archer",
                                    count: 0
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
                                    count: 1
                                },
                                {
                                    type: "archer",
                                    count: 0
                                },
                                {
                                    type: "knight",
                                    count: 0
                                }
                            ],
                            bot: $scope.bots[0]
                        }
                    ],
                    winningConditions: [
                        { name: "lastManStand" }
                    ],
                    onFinish: function() {
                        $scope.$applyAsync();
                    }
                };
                //console.log($scope.bots);
                ChallengeStorage.saveChallengeSetup($scope.challengeSetup);

                $scope.game = ChallengeSetup.createGame($scope.challengeSetup, false);
                $scope.options.pause = true;
            }


            UserStorage.loadUserBots().then(function(bots) {
                $scope.bots = bots;

                // Load setup
                $scope.challengeSetup = ChallengeStorage.loadChallengeSetup($scope.bots);


                if ($scope.challengeSetup != null) {
                    $scope.challengeSetup.onFinish = function() {
                        $scope.$applyAsync();
                    };

                    createGame();
                } else {
                    loadDefaultChallengeSetup();
                }
            });

            $scope.showCodeEditor = false;

            function createGame() {
                $scope.game = ChallengeSetup.createGame($scope.challengeSetup);
                $scope.options.pause = true;
            }
            function reloadGame() {
                createGame();
                ChallengeStorage.saveChallengeSetup($scope.challengeSetup);
            }

            $scope.$watch("challengeSetup.continuous", reloadGame);
            $scope.$watch("challengeSetup.winningConditions", reloadGame, true);
            $scope.$watch("challengeSetup.sides[0].units", reloadGame, true);
            $scope.$watch("challengeSetup.sides[1].units", reloadGame, true);

            $scope.testFight = function () {
                $scope.game = ChallengeSetup.createGame($scope.challengeSetup, true);
                $scope.options.pause = false;
            };

            $scope.showPublishConfirm = function () {
                $modal.open({
                    templateUrl: "angular/main/challenge/create-challenge/confirm-publish-modal.html",
                    controller: "create-challenge.confirm-modal.Ctrl",
                    resolve: { getChallengeSetup: function() {return $scope.challengeSetup; } }
                });
            };
        })

        .controller("create-challenge.confirm-modal.Ctrl", function($scope, ChallengeServer, SecurityService, $modalInstance, challengeSetup) {

            $scope.challenge = {
                challengeSetup: challengeSetup
            };

            $scope.publish = function() {
                if (!SecurityService.isSignedIn()) {
                    SecurityService.showSigninModal().then(function() {
                        ChallengeServer.postChallenge($scope.challenge).success(function() {
                            $modalInstance.close();
                        });
                    });
                } else {
                    ChallengeServer.postChallenge($scope.challenge).success(function() {
                        $modalInstance.close();
                    });
                }
            };

            $scope.cancel = $modalInstance.dismiss;
        })


        .factory("ChallengeStorage", function() {
            return {
                saveChallengeSetup: function(challengeSetup) {
                    var toSave = ObjectUtil.clone(challengeSetup);
                    delete toSave.onFinish;
                    for (var i = 0; i < toSave.sides.length; i++) {
                        var side = toSave.sides[i];
                        if (side.bot != null) {
                            delete side.bot.code;
                        }
                    }
                    localStorage["create-challenge.challengeSetup"] = JSON.stringify(toSave);
                },
                loadChallengeSetup: function(bots) {
                    //delete localStorage["create-challenge.challengeSetup"];
                    var loadStr = localStorage["create-challenge.challengeSetup"];
                    //loadStr = null;
                    if (loadStr == null) {
                        return null;
                    }
                    var challengeSetup = JSON.parse(loadStr);
                    for (var i = 0; i < challengeSetup.sides.length; i++) {
                        var side = challengeSetup.sides[i];

                        var find = Cols.find(bots, function (bot) {
                            return bot.name == side.bot.name;
                        });
                        side.bot = find;
                    }
                    return challengeSetup
                }
            };
        })

    ;

})();