"use strict";

(function () {

    angular.module('bw.test.ani', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('ani', {
                    url: '/ani',
                    templateUrl: "tests/ani/test-ani.html",
                    controller: "bw.test.ani.Ctrl"
                })
            ;
        }])

        .controller("bw.test.ani.Ctrl", function($scope, testTypes) {
            $scope.testTypes = testTypes;
            //$scope.unitType = "footman";
            $scope.view = {
                //unitType : "footman"
                //unitType : "peasant"
                unitType : "knight"
            };

            //var direction = 0* Math.PI / 4;
            var direction = 1* Math.PI / 4;
            //var direction = 2* Math.PI / 4;
            //var direction = 3* Math.PI / 4;
            //var direction = 4* Math.PI / 4;
            var position = null;

            function singleGame(bot) {
                return {
                    sides: [
                        {
                            color: "blue",
                            units: [
                                {
                                    type: $scope.view.unitType,
                                    position: position || {x: 100, y: 200},
                                    direction: 0,
                                    bot: bot
                                }
                            ]
                        }
                    ]
                };
            }

            $scope.testRotate = function() {
                var rotateBot = {
                    run: function (control) {
                        direction += Math.PI/2;
                        control.direction = direction;
                    }
                };
                $scope.game = singleGame(rotateBot);
            };


            $scope.changeDir = function() {
                direction += Math.PI / 4;
            };
            $scope.testWalk = function() {
                var walkBot = {
                    run: function (control) {
                        control.direction = direction;
                        control.goForward();
                        position = control.position;
                    }
                };
                $scope.game = singleGame(walkBot);
            };
            $scope.testFight = function() {
                //var fighted = false;
                var fightBot = {
                    run: function (control) {
                        control.direction = direction;
                        //if (!fighted) {
                            control.fight();
                            //fighted = true;
                        //}
                    }
                };
                $scope.game = singleGame(fightBot);
            };

            $scope.testFight();
        })
    ;

})();