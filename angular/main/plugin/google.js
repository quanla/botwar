"use strict";

(function () {

    angular.module('bw.google', [
    ])

        .directive("gPlusone", function() {
            return {
                restrict: "E",
                link: function($scope, elem, attrs) {
                    $scope.$watch(function() { return elem.attr("href")}, function(href) {
                        gapi.plusone.render(elem[0], {
                            href: href,
                            align: attrs.align,
                            callback: function(jsonParam) {
                                $scope.$eval(attrs.callback, {jsonParam: jsonParam});
                            }
                        });
                    });
                }
            };
        })

        .factory("GoogleSignin", function($rootScope) {
            // Load the SDK asynchronously
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.onload = function() {
                    loadGapi(gapi);
                };
                js.src = "https://apis.google.com/js/platform.js";
                fjs.parentNode.insertBefore(js, fjs);

            }(document, 'script', 'google-platform'));

            var googleReady = false;
            var onProfile;

            var gAuth;
            function loadGapi(gapi) {

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
                            onProfile({
                                id: profile.getId(),
                                name: profile.getName(),
                                imageUrl: profile.getImageUrl(),
                                email: profile.getEmail()
                            });
                            //// The ID token you need to pass to your backend:
                            //var id_token = googleUser.getAuthResponse().id_token;
                            //console.log("ID Token: " + id_token);
                        } else {
                            onProfile(null);
                            //delete User.google;
                        }

                        if (!$rootScope.$$phase) $rootScope.$digest();
                    });


                });
            }


            return {
                ready: function() {
                    return googleReady;
                    //if (googleReady) {
                    //    func();
                    //    if (!$rootScope.$$phase) $rootScope.$digest();
                    //} else {
                    //    onReady = func;
                    //}
                },
                onProfile: function(func) {
                    onProfile = func;
                },
                signout: function() {
                    gAuth.signOut();
                }
            };
        })
    ;

})();