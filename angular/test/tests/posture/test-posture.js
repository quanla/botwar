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
            $scope.unitType = "archer";
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
                        frames.push($scope.unitType + "_stand0_" + $scope.direction + ".png");
                    }
                    if (state == "walk") {
                        for (var j = 0; j < 4; j++) {
                            frames.push($scope.unitType + "_walk" + j + "_" + $scope.direction + ".png");

                        }
                    }
                    if (state == "fight") {
                        for (var j = 0; j < ($scope.unitType=='footman' ? 4 : 2); j++) {
                            frames.push($scope.unitType + "_fight" + j + "_" + $scope.direction + ".png");

                        }
                    }
                    if (state == "die") {
                        for (var j = 0; j < 3; j++) {
                            var dir = Math.floor($scope.direction / 2) * 2 + 1;
                            frames.push($scope.unitType + "_die" + j + "_" + dir + ".png");
                        }
                    }
                }
                $scope.postureEditor.frames = frames;
            };

            $scope.$watch("unitType", show);
            $scope.$watch("direction", updateEditor);
            $scope.$watch("states", updateEditor);


            function show() {
                var jsonUrl = "../../assets/sprites/" + $scope.unitType + ".json";
                console.log(jsonUrl);
                $http.get(jsonUrl).success(function(data) {
                    var imageUrl = jsonUrl.replace(/\w+\.json$/, '') + data.meta.image;

                    $scope.postureEditor.imageUrl = imageUrl;
                    $scope.postureEditor.data = data.frames;

                    updateEditor();
                    $scope.saveSpriteSheet = function() {
                        console.log(jsonUrl);
                        $http.post(jsonUrl, data);
                    };
                });
            }
        })
    ;

})();