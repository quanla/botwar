"use strict";

(function () {

    angular.module('bw.main.challenge.condition-selector', [
        'bw.challenge.win-conditions'
    ])
        .directive("conditionSelector", function(WinConditions, $modal) {
            return {
                restrict: "E",
                templateUrl: "angular/main/challenge/condition-selector/condition-selector.html",
                scope: {
                    setup: "="
                },
                link: function($scope, elem, attrs) {
                    $scope.getName = WinConditions.getName;
                    $scope.wouldApply = function(cond) {
                        return WinConditions.wouldApply(cond, $scope.setup);
                    };

                    $scope.remove = function(cond) {
                        Cols.remove(cond, $scope.setup.winningConditions);
                    };

                    $scope.showAddCondModal = function() {
                        $modal.open({
                            templateUrl: "angular/main/challenge/condition-selector/add-cond-modal.html",
                            controller: "add-cond-modal.ctrl"
                        })
                            .result.then(function(cond) {
                                $scope.setup.winningConditions.push(cond);
                            });
                    };
                }
            };
        })

        .controller("add-cond-modal.ctrl", function($scope, $modalInstance, WinConditions) {
            $scope.modal = {
                focus: null
            };

            $scope.conds = [
                { name: "lastManStand" },
                { name: "hasMorePoints", after: 10 }
            ];
            $scope.getName = WinConditions.getName;
            $scope.getDescription = WinConditions.getDescription;
            $scope.cancel = $modalInstance.dismiss;

            $scope.accept = function() {
                $modalInstance.close($scope.modal.focus);
            };
        })
    ;

})();