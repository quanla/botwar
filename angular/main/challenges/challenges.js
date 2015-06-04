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

        .controller("challenges.ctrl", function($http, $scope) {

        })

        .directive("bwChallengesIde", function() {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenges/challenges-ide.html",
                link: function($scope, elem, attrs) {

                }
            };
        })
    ;

})();