"use strict";

(function () {

    angular.module('bw.main.challenge', [
        'ui.router'
    ])

        .config(["$stateProvider", function ($stateProvider) {

            $stateProvider
                .state('challenge', {
                    url: '/challenge',
                    templateUrl: "angular/main/challenge/challenge.html",
                    controller: "challenge.ctrl"
                })
            ;
        }])

        .controller("challenge.ctrl", function($scope) {

        })

    ;

})();