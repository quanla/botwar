"use strict";

(function () {

    angular.module('bw.main.challenges.c3', [
    ])
        .factory("Challenge3", function() {
            return {
                name: "Challenge 3 - Super dodger",
                intro: "Dare your enemy to hit you",
                jumbotron: {
                    h2: "No running away.",
                    p: "Now you face him like a man. Show him you are the Kung Fu master, stand and dodge his swings."
                },
                messages: [
                    "This time, don't move too much, stand and wait until he fight and dodge like a pro.",
                    "If you don't move much, you would look super cool. The guy will respect you for he knows that he is no match for your fighting skill.",
                    "Dodge 5 times, he will kneel before you.",
                    "Pssst... try this: console.log(minDisE.state), it tells you when enemy attack, and control.round is important too"
                ],
                congrats: {
                    h2: "Well done, you are the real champion",
                    p: "You have mastered the art of dodging, no one can touch you now"
                },
                battleSetup: function() {
                    var countHit = 0;

                    var setup;
                    return setup = {
                        redBot: "fight",
                        checkFinish: function(game) {

                            var blue = game.sides[0].units[0];

                            if (Distance.between(blue.position, {x: 100, y: 150}) > 100) {
                                return {
                                    h2: "You moved too far",
                                    p: "Don't move too much, running away won't earn you any respect."
                                };
                            }

                            if (blue.state != null && blue.state.name == "die") {
                                return {
                                    h2: "Oh no, he killed you!",
                                    p: "Run faster next time will you..."
                                };
                            }

                            var red = game.sides[1].units[0];
                            if (red.state != null && red.state.name == "die") {
                                return {
                                    h2: "Oh no, don't kill him!",
                                    p: "I know you are strong, but this time, dodge..."
                                };
                            }
                        },
                        afterRoundDynamics: function() {

                            var blue = setup.game.sides[0].units[0];

                            if (Distance.between(blue.position, {x: 100, y: 150}) > 100) {
                                setup.game.finish();
                            }

                        },
                        afterRedBotRun: function(unit) {
                            if (unit.state != null && unit.state.name == "fight") {
                                countHit++;
                                if (countHit == 5) {
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