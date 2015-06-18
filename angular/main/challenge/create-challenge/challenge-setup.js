"use strict";

(function () {

    angular.module('bw.main.challenge.challenge-setup', [
    ])
        .factory("ChallengeSetup", function(BattleSetup) {
            return {
                createGame: function(challengeSetup, prepareBot) {
                    return BattleSetup.createGame(challengeSetup, prepareBot);
                }
            };
        })
    ;

})();