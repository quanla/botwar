"use strict";

(function () {

    angular.module('bw.main.create-challenge.condition-selector', [
    ])
        .directive("conditionSelector", function() {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/create-challenge/condition-selector.html",
                link: function($scope, elem, attrs) {

                }
            };
        })
    ;

})();