"use strict";

(function () {

    angular.module('bw.main.campaign.m2', [
    ])
        .factory("Mission2", function() {
            return {
                name: "Mission 2 - Now... run",
                intro: "This time you won't be allowed to fight",
                jumbotron: {
                    h2: "So you can fight, huh?",
                    p: "Red guy's brother is angry, and he is coming for you. Get ready..."
                },
                messages: [
                    "Killing the Idle guy doesn't prove anything, this time you are not allowed to fight.",
                    "The Red guy's brother will try to hit you, if you can dodge 3 times, he will be too tired to " +
                    "continue... then you will win."
                ],
                congrats: {
                    h2: "Well done, he is on his knee now!",
                    p: "\"So in war, the way is to avoid what is strong, and strike at what is weak.\" -  Sun Tzu"
                },
                battleSetup: function() {
                    var countHit = 0;

                    var setup;
                    return setup = {
                        redBot: "fight",
                        checkFinish: function(game) {

                            var blue = game.sides[0].units[0];
                            if (blue.state.name == "die") {
                                return {
                                    h2: "Oh no, he killed you!",
                                    p: "Run faster next time will you..."
                                };
                            }

                            var red = game.sides[1].units[0];
                            if (red.state.name == "die") {
                                return {
                                    h2: "Oh no, don't kill him!",
                                    p: "I know you are strong, but this time, run..."
                                };
                            }
                        },
                        afterRedBotRun: function(unit) {
                            if (unit.state.name == "fight") {
                                countHit++;
                                if (countHit == 3) {
                                    //unit.state = null;
                                    setTimeout(function() {
                                        setup.game.finish();
                                    }, 1000);
                                }
                            }
                        }
                    };
                }
            };
        })

    ;

})();