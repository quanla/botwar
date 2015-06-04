"use strict";

(function () {

    angular.module('bw.main.user', [
    ])
        .factory("User", function(SampleBot, $q) {
            function loadFromLocal() {
                var bots = [];

                for (var i = 0; i < localStorage.bots_count; i++) {
                    bots.push(loadBot(i));
                }
                return bots;
            }
            function loadBot(i) {
                return {
                    name: localStorage["bot" + i + "_name"],
                    code: localStorage["bot" + i + "_code"]
                };
            }

            function shiftBots() {
                for (var i = localStorage.bots_count - 1; i > -1; i--) {
                    localStorage["bot" + (i+1) + "_name"] = localStorage["bot" + i + "_name"];
                    localStorage["bot" + (i+1) + "_code"] = localStorage["bot" + i + "_code"];
                }
                localStorage.bots_count = localStorage.bots_count*1 + 1;
            }
            return {
                loadUserBots: function() {
                    var defer = $q.defer();

                    if (localStorage.bots_count == null) {
                        var runAfterCount = Async.runAfterCount(3, function() {
                            defer.resolve(loadFromLocal());
                        });
                        SampleBot.loadFighter(function(source1) {
                            localStorage["bot0_code"] = source1;
                            runAfterCount();
                        });
                        SampleBot.loadRunner(function(source1) {
                            localStorage["bot1_code"] = source1;
                            runAfterCount();
                        });
                        SampleBot.loadVeteran(function(source1) {
                            localStorage["bot2_code"] = source1;
                            runAfterCount();
                        });

                        localStorage.bots_count = 3;
                        localStorage["bot0_name"] = "Fighter";
                        localStorage["bot1_name"] = "Run away";
                        localStorage["bot2_name"] = "Veteran";
                    } else {
                        defer.resolve(loadFromLocal());
                    }
                    return defer.promise;
                },
                saveBot: function(bot, index) {
                    localStorage["bot" + index + "_name"] = bot.name;
                    localStorage["bot" + index + "_code"] = bot.code;
                },
                newBot: function() {
                    var defer = $q.defer();
                    SampleBot.loadEmpty(function(source) {
                        shiftBots();
                        localStorage["bot0_name"] = "New Bot";
                        localStorage["bot0_code"] = source;

                        defer.resolve(loadBot(0));

                    });
                    return defer.promise;
                }
            };
        })
    ;

})();