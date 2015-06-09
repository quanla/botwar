"use strict";

(function () {

    angular.module('bw.main.header', [
    ])
        .directive("bwMainHeader", function(SecurityService, User, $rootScope, GoogleSignin) {
            return {
                restrict: "A",
                scope: true,
                link: function($scope, elem, attrs) {
                    GoogleSignin.onProfile(function(google) {
                        if (google) {
                            User.google = google;
                        } else {
                            delete User.google;
                        }
                    });


                    $scope.userName = function() {
                        if (User.google) {
                            return User.google.name;
                        } else {
                            return null;
                        }
                    };

                    $scope.signout = function() {
                        if (User.google != null) {
                            GoogleSignin.signout();
                        }
                    };

                    $scope.ready = function() {
                        return GoogleSignin.ready();
                    };

                    $scope.signin = function() {
                        SecurityService.showSigninModal();
                    };
                }
            };
        })

    ;

})();