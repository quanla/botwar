"use strict";

(function () {

    angular.module('bw.common.model', [
    ])
        .directive("optionCond", function($parse) {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {
                    var setters = [];
                    var checkers = [];

                    var condStrs = attrs.optionCond.split(/\s*,\s*/);
                    for (var i = 0; i < condStrs.length; i++) {
                        var split = condStrs[i].split(/\s*:\s*/);
                        var model = $parse(split[0]);
                        var value = split[1];

                        setters.push( function() {
                            model.assign($scope, $scope.$eval(value));
                        } );
                        checkers.push( function() {
                            return model($scope) == $scope.$eval(value);
                        } );
                    }

                    $scope.$watch(function() {
                        for (var i = 0; i < checkers.length; i++) {
                            if (!checkers[i]()) {
                                return false;
                            }
                        }
                        return true;
                    }, function(value) {
                        elem.prop("selected", value);
                    });

                    elem.parent().change(function() {
                        if (elem.prop("selected")) {
                            Fs.invokeAll(setters);

                            if (!$scope.$$phase) $scope.$digest();
                        }
                    });
                }
            };
        })
    ;

})();