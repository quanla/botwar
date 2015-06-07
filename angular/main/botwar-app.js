"use strict";

(function () {
    /* App Module */
    angular.module("bw.main.app", [
        'bw.battlefield',
        'bw.main',
        'ui.router'
    ])


        .config(["$urlRouterProvider", function ($urlRouterProvider) {
            $urlRouterProvider
                // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
                .otherwise("/hello");
        }])

        .run(["$rootScope", "$state", "$stateParams", function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }])


    ;
})();
