"use strict";

(function () {

    angular.module('bw.fancybox', [
    ])

        .factory("Fancybox", ["$q", "$compile", "$templateCache", "$http", "$controller", "$rootScope", function($q, $compile, $templateCache, $http, $controller, $rootScope) {
            var open = function($scope, options) {
                var opened = false;

                var scope = $scope.$new();

                if (options.resolve) {
                    for (var name in options.resolve) {
                        scope[name] = options.resolve[name];
                    }
                }

                //options.templateUrl
                var templatePromise = $http.get(options.templateUrl, {cache: $templateCache}).then(function (result) {
                    return result.data;
                });

                var closeListeners = [];
                templatePromise.then(function(content) {
                    var invokeCloseListeners = function() {
                        Fs.invokeAll(closeListeners);
                        closeListeners = [];
                    };

                    closeListeners.push(function() {
                        scope.$destroy();
                    });

                    var close = function () {
                        $.fancybox.close();
                    };
                    if (options.controller) {
                        $controller(options.controller, {'$scope': scope, "$modalInstance": { close: close, dismiss: close }});
                    }
                    var contentEl = $compile(angular.element(content))(scope);

                    $.fancybox({
                        content: contentEl,
                        maxWidth: options.width? options.width : 750,
                        width: options.width? options.width : "auto",
                        height: 'auto',
                        fitToView: false,
                        autoSize: false,
                        afterShow: function() {
                            opened = true;
                        },
                        afterClose: function() {
                            if (opened) {
                                invokeCloseListeners();
                            }
                        },
                        closeClick: false,
                        helpers: {
                            overlay: {
                                locked: false
                            }
                        }
                    });

                    $scope.$on("$destroy", close);

                });

                return {
                    onClose: function(cl) {
                        closeListeners.push(cl);
                    }
                };

            };

            return {
                open: open
            };
        }])

        .controller("pct.fancybox.PromptTextCtrl", ["$scope", "$modalInstance", function($scope, $modalInstance) {
            $scope.pop = {
                text: null
            };
            $scope.close = $modalInstance.close;
            $scope.save = function() {
                $scope.action($scope.pop.text);
                $modalInstance.close();
            };
        }])

        .controller("pct.fancybox.ConfirmCtrl", ["$scope", "$modalInstance", function($scope, $modalInstance) {
            $scope.close = $modalInstance.close;
            $scope.save = function() {
                $scope.action();
                $modalInstance.close();
            };
        }])

        .controller("pct.fancybox.AlertCtrl", ["$scope", "$modalInstance", function($scope, $modalInstance) {
            $scope.close = function() {
                $scope.action();
                $modalInstance.close();
            };
        }])
    ;
})();