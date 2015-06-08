"use strict";

(function () {

    angular.module('bw.main.header', [
    ])
        .factory("User", function() {
            return {

            };
        })
        .directive("bwMainHeader", function($modal, User) {
            return {
                restrict: "A",
                scope: true,
                link: function($scope, elem, attrs) {
                    var gAuth;
                    gapi.load('auth2', function(){
                        console.log(111);
                        // Retrieve the singleton for the GoogleAuth library and set up the client.
                        gAuth = gapi.auth2.init({
                            client_id: '571408501053-cs49dg32cc4g5k61dj8md39e9va1sfn6.apps.googleusercontent.com'
                            //cookiepolicy: 'single_host_origin',
                            // Request scopes in addition to 'profile' and 'email'
                            //scope: 'additional_scope'
                        });

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

                            if (!$scope.$$phase) $scope.$digest();
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

                    $scope.signin = function() {
                        $modal.open({
                            templateUrl: "angular/main/header/sign-in-modal.html",
                            controller: "header.signin-modal"
                        });
                    };
                }
            };
        })

        .controller("header.signin-modal", function($scope, $modalInstance, User) {


            $scope.signinGoogle = function() {
                console.log("Siggeg " + User.google);
                if (User.google == null) {
                    gapi.auth2.getAuthInstance().signIn({
                        scope: "profile email"
                    })
                        .then(function() {
                            $modalInstance.close();
                        });
                }
            };

            $scope.cancel = $modalInstance.dismiss;
        })
    ;

})();