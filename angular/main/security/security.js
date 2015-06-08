"use strict";

(function () {

    angular.module('bw.main.security', [
    ])

        .factory("User", function() {
            return {

            };
        })

        .factory("SecurityService", function(User, $modal) {
            return {
                showSigninModal: function() {
                    return $modal.open({
                        templateUrl: "angular/main/security/sign-in-modal.html",
                        controller: "security.signin-modal"
                    }).result;
                },
                isSignedIn: function() {
                    return User.google != null;
                }
            };
        })

        .controller("security.signin-modal", function($scope, $modalInstance, SecurityService, User) {

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


        .provider("Api", function() {
            var _host = null;

            this.setHost = function(host) {
                _host = host;
            };

            this.$get = ["$http", "User", function($http, User) {
                var defaultErrorHandlers = [];

                var handleError = function(httpPromise) {

                    var _handler = null;

                    httpPromise.onError = function(handler) {
                        _handler = handler;
                        return httpPromise;
                    };

                    httpPromise.error(function(data, status, headers, config) {
                        if (_handler != null) {
                            var handleResult = _handler(data, status, headers, config);
                            if (handleResult) {
                                return;
                            }
                        }

                        for (var i = 0; i < defaultErrorHandlers.length; i++) {
                            var eh = defaultErrorHandlers[i];
                            if (eh(data, status, headers, config)) {
                                return;
                            }
                        }

                        //alert("Unhandled api error:\nUrl: " + config.url + "\nResponse status: " + status + "\n" + JSON.stringify(data));
                        //console.log("Unhandled api error:\n    Url: " + config.url + "\n    Response status: " + status);
                        //console.log(data);

                        alert("An error occured");
                    });

                    return httpPromise;
                };

                var sendHttp = function(method, url, data) {
                    var headers = {};
                    if (User.google != null) {
                        headers["Authen-Type"] = "google";
                        headers["Authen-Id"] = User.google.id;
                        headers["Authen-Username"] = User.google.name;
                        headers["Authen-Email"] = User.google.email;
                    }
                    return handleError($http({
                        method: method,
                        url: (_host ? _host + "/" : "") + url,
                        headers: headers,
                        data: data
                    }));
                };
                return {

                    get: function(url) {
                        return sendHttp("GET", url);
                    },
                    post: function(url, data) {
                        return sendHttp("POST", url, data);
                    },
                    put: function(url, data) {
                        return sendHttp("PUT", url, data);
                    },
                    delete: function(url) {
                        return sendHttp("DELETE", url);
                    },
                    onError: function(handler) {
                        defaultErrorHandlers.push(handler);
                    },
                    getHost: function() {
                        return _host;
                    },
                    handleError: handleError
                };
            }];
        })
    ;

})();