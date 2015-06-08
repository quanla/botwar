"use strict";

(function () {

    angular.module('bw.main.header', [
    ])
        .factory("User", function() {
            return {

            };
        })
        .directive("bwMainHeader", function(SecurityService, User, $rootScope) {
            return {
                restrict: "A",
                scope: true,
                link: function($scope, elem, attrs) {
                    var googleReady = false;

                    var gAuth;
                    gapi.load('auth2', function(){
                        // Retrieve the singleton for the GoogleAuth library and set up the client.
                        gAuth = gapi.auth2.init({
                            client_id: '571408501053-cs49dg32cc4g5k61dj8md39e9va1sfn6.apps.googleusercontent.com'
                            //cookiepolicy: 'single_host_origin',
                            // Request scopes in addition to 'profile' and 'email'
                            //scope: 'additional_scope'
                        });

                        googleReady = true;

                        if (!$rootScope.$$phase) $rootScope.$digest();

                        gAuth.isSignedIn.listen(function() {
                            if (gAuth.isSignedIn.get()) {
                                var profile = gAuth.currentUser.get().getBasicProfile();
                                User.google = {
                                    id: profile.getId(),
                                    name: profile.getName(),
                                    imageUrl: profile.getImageUrl(),
                                    email: profile.getEmail()
                                };
                                //// The ID token you need to pass to your backend:
                                //var id_token = googleUser.getAuthResponse().id_token;
                                //console.log("ID Token: " + id_token);
                            } else {
                                delete User.google;
                            }

                            if (!$rootScope.$$phase) $rootScope.$digest();
                        });


                        $scope.userName = function() {
                            if (User.google) {
                                return User.google.name;
                            } else {
                                return null;
                            }
                        };
                    });

                    $scope.signout = function() {
                        if (User.google != null) {
                            gAuth.signOut();
                        }
                    };

                    $scope.ready = function() {
                        return googleReady;
                    };

                    $scope.signin = function() {
                        SecurityService.showSigninModal();
                    };
                }
            };
        })

        .factory("SecurityService", function(User, $modal) {
            return {
                showSigninModal: function() {
                    return $modal.open({
                        templateUrl: "angular/main/header/sign-in-modal.html",
                        controller: "header.signin-modal"
                    }).result;
                },
                isSignedIn: function() {
                    return User.google != null;
                }
            };
        })

        .controller("header.signin-modal", function($scope, $modalInstance, SecurityService, User) {

            $scope.signinGoogle = function() {
                if (User.google == null) {
                    gapi.auth2.getAuthInstance().signIn({
                        scope: "profile email"
                    });


                }
            };

            $scope.$watch(function() { return SecurityService.isSignedIn(); }, function(signedIn) {
                if (signedIn) {
                    $modalInstance.close();
                }
            });

            $scope.cancel = $modalInstance.dismiss;
        })
    ;

})();