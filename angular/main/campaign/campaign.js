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

        .controller("campaign.ctrl", function(UserStorage, $scope, BotSource, Campaign) {
            UserStorage.loadUserBots().then(function(bots) {
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
                $scope.game = Campaign.setupGame($scope.mission, $scope.currentBot,
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

        .factory("Campaign", function(SampleBot, BotSource, BattleSetup,
                                        Mission1, Mission2, Mission3) {

            var bots = {};

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

                    var missionSetup = {};
                    if (mission.battleSetup) {
                        missionSetup = mission.battleSetup();
                        SampleBot.loadBot(missionSetup.redBot, function(source) {
                            bots[missionSetup.redBot] = {code: source};
                        });
                    }

                    var game = BattleSetup.createGame({
                        sides: [
                            {
                                color: "blue",
                                units: [
                                    {
                                        type: "footman",
                                        count: 1
                                    }
                                ],
                                bot: userBot
                            },
                            {
                                color: "red",
                                units: [
                                    {
                                        type: "footman",
                                        count: 1,
                                        afterBotRun: missionSetup.afterRedBotRun
                                    }
                                ],
                                bot: userBot == null || missionSetup.redBot==null ? null : bots[missionSetup.redBot]
                            }
                        ],
                        width: 500,
                        height: 500,
                        afterRoundDynamics: missionSetup.afterRoundDynamics,
                        onFinish: function() {

                            //onFail
                            if (missionSetup.checkFinish == null) {
                                onFinish();
                            } else {
                                var checkFinish = missionSetup.checkFinish(game);
                                if (checkFinish) {
                                    onFail(checkFinish);
                                } else {
                                    onFinish();
                                }
                            }
                        }
                    });

                    missionSetup.game = game;

                    return game;
                }
            };
        })

    ;

})();