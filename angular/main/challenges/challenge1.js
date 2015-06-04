"use strict";

(function () {

    angular.module('bw.main.challenges.c1', [
    ])
        .factory("Challenge1", function() {
            return {
                name: "Challenge 1 - Idle bot",
                jumbotron: {
                    h2: "Hi there!",
                    p: "Welcome to the Arena, where your bot will take challenges from various battle hardened " +
                    "warriors"
                },
                messages: [
                    "The first fight will be rather easy. Your opponent will not move or fight, he only stares at you.",
                    "Man, he doesn't care to live anymore, finish him."
                ],
                congrats: {
                    h2: "Well done, you finished him!",
                    p: "Please don't feel bad for him, he doesn't feel a thing"
                }
            };
        })

    ;

})();