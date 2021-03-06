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
                },
                postReply: function(challengeReply) {
                    return Api.post("challenge/" + challengeReply.toChallenge + "/reply", challengeReply);
                },
                getReply: function(challenge) {
                    return Api.get("challenge/" + challenge.id + "/reply");
                },
                getNextReply: function(challenge, reply) {
                    return Api.get("challenge/" + challenge.id + "/next_reply/" + reply.id);
                },
                getPrevReply: function(challenge, reply) {
                    return Api.get("challenge/" + challenge.id + "/prev_reply/" + reply.id);
                }
            };
        })
    ;

})();