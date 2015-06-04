"use strict";

(function () {

    angular.module('bw.sample', [
    ])
        .factory("SampleBot", function($http) {
            function loadBot(name, onDone) {
                $http.get("/botwar/sample-bots/" + name + "-bot.js").success(function(source) {
                    if (onDone) onDone(source);
                });
            }
            return {
                loadBot: loadBot,
                loadEmpty: function(onDone) {
                    loadBot("empty", onDone);
                },
                loadFighter: function(onDone) {
                    loadBot("fight", onDone);
                },
                loadRunner: function(onDone) {
                    loadBot("run", onDone);
                },
                loadVeteran: function(onDone) {
                    loadBot("veteran", onDone);
                }
            };
        })

        .factory("BotSource", function() {
            return {
                createBot: function(source) {
                    var allowLogging = true;
                    var botFunc = eval("(function() {" + (allowLogging ? "" : "var console=null;") + source + "\nreturn Bot;})()");

                    var bot = new botFunc();

                    return bot;
                }
            };
        })

        .factory("SampleFightBot", function(BotSource, SampleBot) {
            return {
                createSampleBot: function(onDone) {
                    SampleBot.loadFighter(function(source) {
                        onDone(BotSource.createBot(source));
                    });
                }
            };
        })
        .factory("SampleRunBot", function(BotSource, SampleBot) {
            return {
                createSampleBot: function(onDone) {
                    SampleBot.loadRunner(function(source) {
                        onDone(BotSource.createBot(source));
                    });
                }
            };
        })
        .factory("SampleVeteranBot", function(BotSource, SampleBot) {
            return {
                createSampleBot: function(onDone) {
                    SampleBot.loadVeteran(function(source) {
                        onDone(BotSource.createBot(source));
                    });
                }
            };
        })
    ;

})();