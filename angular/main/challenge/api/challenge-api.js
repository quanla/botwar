"use strict";

(function () {

    angular.module('bw.main.challenge-api', [
    ])


        .factory("ChallengeServer", function($http, Api) {

            return {
                postChallenge: function(challenge) {
                    return Api.post("challenges", challenge);
                },
                getChallenges: function() {
                    return Api.get("challenges");
                },
                getChallenge: function(challengeId) {
                    return Api.get("challenge/" + challengeId);
                },
                deleteChallenge: function(challengeId) {
                    return Api.delete("challenge/" + challengeId);
                },
                plusoneChallenge: function(challenge, state) {
                    return Api.put("challenge/" + challenge.id + "/plusone/" + state);
                },
                countReplies: function(challenge) {
                    return Api.get("challenge/" + challenge.id + "/count_replies");
                }
            };
        })
    ;

})();