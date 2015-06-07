"use strict";

(function () {

    angular.module('bw.main.challenge-api', [
    ])
        .factory("ChallengeServer", function($http) {

            var host = "http://localhost:1006";

            return {
                postChallenge: function(challenge) {
                    return $http.post(host + "/challenges", challenge);
                },
                getChallenges: function() {
                    return $http.get(host + "/challenges");
                },
                getChallenge: function(challengeId) {
                    return $http.get(host + "/challenge/" + challengeId);
                }
            };
        })
    ;

})();