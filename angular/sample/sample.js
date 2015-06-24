"use strict";

(function () {

    angular.module('bw.sample', [
    ])
        .factory("SampleBot", function($http) {
            function loadBot(name, onDone) {
                return $http.get("/botwar/sample-bots/" + name + "-bot.js").success(function(source) {
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

    ;

})();