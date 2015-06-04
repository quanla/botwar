"use strict";

(function () {

    angular.module('bw.main.ide', [
        'bw.main.plugin.code-mirror'
    ])

        .directive("bwEditor", function(SampleBot, User) {
            return {
                restrict: "E",
                templateUrl: "angular/main/ide/ide.html",
                link: function($scope, elem, attrs) {

                    $scope.$watch("::bots", function() {
                        $scope.currentBot = $scope.bots[0];
                    });

                    $scope.createNewBot = function() {
                        User.newBot().then(function(newBot) {
                            $scope.bots.splice(0,0, newBot);
                            $scope.currentBot = newBot;
                        });
                    };

                    var saveCurrentBot = function () {
                        User.saveBot($scope.currentBot, $scope.bots.indexOf($scope.currentBot));
                    };
                    $scope.$watch("currentBot.code", saveCurrentBot);
                    $scope.$watch("currentBot.name", saveCurrentBot);

                }
            };
        })

    ;

})();