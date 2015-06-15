"use strict";

(function () {

    angular.module('bw.main.ide', [
        'bw.main.plugin.code-mirror'
    ])

        .controller("select-bot-modal.Ctrl", function($scope, $modalInstance) {
            $scope.cancel = $modalInstance.dismiss;
            $scope.accept = $modalInstance.close;
        })

        .directive("bwEditor", function(SampleBot, UserStorage, $modal) {
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
                        $modal.open({
                            templateUrl: "angular/main/ide/select-bot-modal.html",
                            controller: "select-bot-modal.Ctrl"
                        })
                            .result.then(function(name) {
                                SampleBot.loadBot(name).success(function(code) {
                                    var botName = StringUtil.uppercaseFirstChar(name).replace("Fight", "Fighter");
                                    var newBot = {name: botName, code: code};
                                    UserStorage.newBot(newBot);

                                    $scope.bots.splice(0,0, newBot);
                                    $scope.bot = newBot;
                                });
                            });
                    };

                    $scope.deleteBot = function() {
                        if (!confirm("Really delete robot " + $scope.bot.name + "?")) return;
                        UserStorage.deleteBot($scope.bots.indexOf($scope.bot));
                        Cols.remove($scope.bot, $scope.bots);
                        $scope.bot = $scope.bots[0];
                    };

                    var saveCurrentBot = function () {
                        if ($scope.bot != null) {
                            UserStorage.saveBot($scope.bot, $scope.bots.indexOf($scope.bot));
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