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

        .factory("GoogleSignin", function($q) {

            function extractProfile(profile) {
                if (profile == null) {
                    return null;
                }
                return {
                    id: profile.getId(),
                    name: profile.getName(),
                    imageUrl: profile.getImageUrl(),
                    email: profile.getEmail()
                };
            }

            return {
                initGoogleSignin: function() {
                    var defer = $q.defer();
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

                    var gAuth;
                    function loadGapi(gapi) {

                        gapi.load('auth2', function(){

                            gAuth = gapi.auth2.init({
                                client_id: '571408501053-cs49dg32cc4g5k61dj8md39e9va1sfn6.apps.googleusercontent.com'
                            });

                            googleReady = true;

                            gAuth.then(function() {

                                defer.resolve({
                                    signin: function() {
                                        var defer = $q.defer();
                                        gAuth.signIn({
                                            scope: "profile email"
                                        }).then(function(resp) {
                                            var profile = resp.getBasicProfile();

                                            if (profile != null) {
                                                defer.resolve(extractProfile(profile));
                                            }
                                        });
                                        return defer.promise;
                                    },
                                    signout: function() {
                                        gAuth.signOut();
                                    },
                                    getProfile: function() {
                                        var profile = gAuth.currentUser.get().getBasicProfile();
                                        return extractProfile(profile);
                                    }
                                });

                            });
                        });
                    }

                    return defer.promise;
                }
            };
        })
    ;

})();