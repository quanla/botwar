"use strict";

(function () {

    angular.module('bw.main.ide', [
        'bw.main.plugin.code-mirror'
    ])

        .directive("bwEditor", function(SampleBot, User) {
            return {
                restrict: "E",
                scope: {
                    bots: "=",
                    currentBot: "=",
                    changeBot: "&"
                },
                templateUrl: "angular/main/ide/ide.html",
                link: function($scope, elem, attrs) {

                    $scope.$watch("bots", function() {
                        if ($scope.bot == null) {
                            $scope.bot = $scope.bots[0];
                        }
                    });
                    $scope.$watch("currentBot", function(currentBot) {
                        if (currentBot != null) {
                            $scope.bot = currentBot;
                        }
                    });

                    $scope.createNewBot = function() {
                        User.newBot().then(function(newBot) {
                            $scope.bots.splice(0,0, newBot);
                            $scope.bot = newBot;
                        });
                    };

                    $scope.deleteBot = function() {
                        User.deleteBot($scope.bots.indexOf($scope.bot));
                        Cols.remove($scope.bot, $scope.bots);
                        $scope.bot = $scope.bots[0];
                    };

                    var saveCurrentBot = function () {
                        if ($scope.bot != null) {
                            User.saveBot($scope.bot, $scope.bots.indexOf($scope.bot));
                        }
                    };
                    $scope.$watch("bot.code", saveCurrentBot);
                    $scope.$watch("bot.name", saveCurrentBot);

                    if ($scope.changeBot) {
                        $scope.$watch("bot", function(bot) {
                            $scope.changeBot({bot: bot});
                        });
                    }

                }
            };
        })

    ;

})();