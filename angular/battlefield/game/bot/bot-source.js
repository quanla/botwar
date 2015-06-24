"use strict";

(function () {

    angular.module('bw.battlefield.game.bot-source', [
    ])
        .factory("BotSource", function() {
            return {
                createBot: function(source, unitType) {
                    if (unitType == null) {
                        null["Null unitType"];
                    }
                    var allowLogging = true;
                    var botFunc = eval("(function() {" + (allowLogging ? "" : "var console=null;") + source + "\nreturn Bot;})()");

                    var bot = new botFunc(unitType);

                    return bot;
                }
            };
        })
    ;

})();