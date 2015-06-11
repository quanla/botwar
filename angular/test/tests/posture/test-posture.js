"use strict";

(function () {

    angular.module('bw.test.posture', [
        'bw.posture.editor',
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('posture', {
                    url: '/posture',
                    templateUrl: "tests/posture/test-posture.html",
                    controller: "bw.test.posture.Ctrl"
                })
            ;
        }])


        .controller("bw.test.posture.Ctrl", function($scope, $http) {
            //$scope.unitType = "footman";
            $scope.view = {
                //unitType: "archer"
                unitType: "peasant"
            };
            $scope.direction = 0;
            //$scope.direction = 2;

            $scope.states = ["stand", "walk"];

            $scope.postureEditor = {};

            $scope.set = function(name, value) {
                $scope[name] = value;
            };

            var updateEditor = function () {
                var frames = [];

                for (var i = 0; i < $scope.states.length; i++) {
                    var state = $scope.states[i];
                    if (state == "stand") {
                        frames.push($scope.view.unitType + "_stand0_" + $scope.direction + ".png");
                    }
                    if (state == "walk") {
                        for (var j = 0; j < 4; j++) {
                            frames.push($scope.view.unitType + "_walk" + j + "_" + $scope.direction + ".png");

                        }
                    }
                    if (state == "fight") {
                        for (var j = 0; j < ($scope.view.unitType=='footman' ? 4 : $scope.view.unitType=='peasant' ? 5 : 2); j++) {
                            frames.push($scope.view.unitType + "_fight" + j + "_" + $scope.direction + ".png");
                        }
                    }
                    if (state == "die") {
                        for (var j = 0; j < 3; j++) {
                            var dir = Math.floor($scope.direction / 2) * 2 + 1;
                            frames.push($scope.view.unitType + "_die" + j + "_" + dir + ".png");
                        }
                    }
                }
                $scope.postureEditor.frames = frames;
            };

            $scope.$watch("view.unitType", show);
            $scope.$watch("direction", updateEditor);
            $scope.$watch("states", updateEditor);


            function show() {
                var jsonUrl = "../../assets/sprites/" + $scope.view.unitType + ".json";
                var imageUrl = "../../assets/sprites/" + $scope.view.unitType + ".png";
                $http.get(jsonUrl).success(function(data) {
                    $scope.postureEditor.imageUrl = imageUrl;
                    $scope.postureEditor.data = data.frames;

                    updateEditor();
                    $scope.saveSpriteSheet = function() {
                        $http.post(jsonUrl, data);
                    };
                });
            }
        })
    ;

})();