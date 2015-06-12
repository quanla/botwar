"use strict";

(function () {

    angular.module('bw.main.campaign', [
        'bw.main.plugin.code-mirror',
        'bw.main.campaign.m1',
        'bw.main.campaign.m2',
        'bw.main.campaign.m3',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('campaign', {
                    url: '/campaign',
                    templateUrl: "angular/main/campaign/campaign.html",
                    controller: "campaign.ctrl"
                })
            ;
        }])

        .controller("campaign.ctrl", function(User, $scope, BotSource, Campaign) {
            User.loadUserBots().then(function(bots) {
                $scope.bots = bots;
                $scope.currentBot = bots[0];
            });
            $scope.showCodeEditor = false;

            $scope.changeBot = function(bot) {
                $scope.currentBot = bot;
            };

            $scope.missions = Campaign.missions;
            $scope.mission = $scope.missions[0];
            //$scope.mission = $scope.mission[2];

            $scope.nextMission = function() {
                return $scope.missions[$scope.missions.indexOf($scope.mission) + 1];
            };
            $scope.toNextMission = function() {
                $scope.mission = $scope.nextMission();
            };

            $scope.$watch("mission", function() {
                $scope.finished = false;

                $scope.failMessage = null;

                $scope.game = Campaign.setupGame($scope.mission);
            });

            $scope.jumbotron = function() {
                return $scope.failMessage || (!$scope.finished ? $scope.mission.jumbotron : $scope.mission.congrats);
            };

            $scope.startGame = function() {
                $scope.game = Campaign.setupGame($scope.mission, function(unitType) { return BotSource.createBot($scope.currentBot.code, unitType);},
                    function() {
                        $scope.$apply(function() {
                            $scope.failMessage = null;
                            $scope.finished = true;
                        });
                    },
                    function(failMessage) {
                        $scope.$apply(function() {
                            $scope.failMessage = failMessage || $scope.mission.failMessage;
                        });
                    }
                );
            };
        })

        .factory("Campaign", function(SampleBot, BotSource,
                                        Mission1, Mission2, Mission3) {

            var bots = {};
            var getBot = function(name, unitType) {
                return BotSource.createBot(bots[name], unitType);
            };

            var missions = [
                Mission1,
                Mission2,
                Mission3
            ];

            return {
                getMission: function(index) {
                    return missions[index];
                },
                missions: missions,
                setupGame: function(mission, userBot, onFinish, onFail) {

                    var battleSetup = {};
                    if (mission.battleSetup) {
                        battleSetup = mission.battleSetup();
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
                                        bot: userBot ? userBot("footman") : null
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
                                        bot: userBot == null || battleSetup.redBot==null ? null : getBot(battleSetup.redBot, "footman"),
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