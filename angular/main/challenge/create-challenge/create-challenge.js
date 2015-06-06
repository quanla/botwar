"use strict";

(function () {

    angular.module('bw.main.create-challenge', [
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
        
        .controller("create-challenge.ctrl", function($scope, User) {
            User.loadUserBots().then(function(bots) {
                $scope.bots = bots;
                $scope.myChampion = bots[0];
            });
            $scope.showCodeEditor = false;


            $scope.changeBot = function(bot) {
                $scope.myChampion = bot;
            };


            $scope.myUnits = [
                {
                    type: "footman",
                    count: 1
                }
            ];

            $scope.addUnit = function(unit) {
                if (unit.count >= 10) return;
                unit.count ++;
            };

            $scope.removeUnit = function(unit) {
                if (unit.count <= 1) return;
                unit.count --;
            }
        })

    ;

})();