"use strict";

(function () {

    angular.module('bw.main.challenge-api', [
    ])
        .factory("ChallengeServer", function($http) {

            var host = "http://localhost:1006";

            return {
                postChallenge: function(challenge) {
                    return $http.post(host + "/challenge", challenge);
                },
                getChallenges: function(challenge) {
                    return $http.get(host + "/challenge", challenge);
                }
            };
        })
    ;

})();