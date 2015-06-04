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

        .controller("challenges.ctrl", function(User, $scope) {
            User.loadUserBots().then(function(bots) {
                $scope.bots = bots;
                $scope.currentBot = bots[0];
            });
            $scope.showCodeEditor = false;

            $scope.changeBot = function(bot) {
                $scope.currentBot = bot;
            }


        })

    ;

})();