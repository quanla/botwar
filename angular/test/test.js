"use strict";

(function () {
    /* App Module */
    angular.module("bw.test.app", [
        'bw.test.ani',
        'bw.test.action',
        'bw.test.posture',
        'bw.test.color',
        'bw.test.bot',
        'bw.test.sprite',
        'bw.battlefield'
    ])
        .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider
                // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
                .otherwise("/bot");
        }])
        .config(function (RenderersProvider) {
            RenderersProvider.assetsLoc = "../../assets";
        })

        .value("testTypes", [
            'footman',
            'archer',
            'peasant',
            'grunt',
            'ballista',
            'ballista_missile',
            'explosion',
            //'zerling',
            'knight'
        ])
    ;
})();
