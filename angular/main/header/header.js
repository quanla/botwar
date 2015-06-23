"use strict";

(function () {

    angular.module('bw.main.header', [
    ])
        .directive("bwMainHeader", function(SecurityService, User) {
            return {
                restrict: "A",
                scope: true,
                link: function($scope, elem, attrs) {
                    $scope.userName = function() {
                        if (User.google) {
                            return User.google.name;
                        } else {
                            return null;
                        }
                    };

                    $scope.signout = function() {
                        if (User.google != null) {
                            SecurityService.signout();
                        }
                    };

                    $scope.ready = function() {
                        return SecurityService.ready();
                    };

                    $scope.signin = function() {
                        SecurityService.signin();
                    };
                }
            };
        })

    ;

})();