"use strict";

(function () {

    angular.module('bw.battlefield.status', [
    ])
        .directive("battleStatus", function() {
            return {
                restrict: "E",
                scope: {
                    game: "="
                },
                templateUrl: "angular/battlefield/battle-status.html",
                link: function($scope, elem, attrs) {
                    $scope.$watch("game", function(game) {
                        if (game != null) {

                            setTimeout(function() {
                                game.sides.forEach(function(side) {
                                    var scoreSpan = elem.find("[side=" + side.color + "]");
                                    scoreSpan.text(0);
                                    side.onScoreChange = function(score) {
                                        scoreSpan.text(score);
                                    };
                                });
                            }, 0);
                        }
                    });

                    $scope.getWonSide = function() {
                        for (var i = 0; i < $scope.game.sides.length; i++) {
                            var side = $scope.game.sides[i];
                            if (side.won) {
                                return side.color;
                            }
                        }
                    };

                }
            };
        })

    ;

})();